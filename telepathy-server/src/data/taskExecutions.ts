import { Span } from "@opentelemetry/sdk-trace-base";
import * as fs from "fs-extra";
import * as _ from "lodash";
import { AppContext } from "../appContext";
import { TaskExecution } from "../common-model/taskExecution";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { TaskOutput } from "../common-model/taskOutput";
import { StandardTracer } from "../utils-std-ts/standardTracer";
import { Logger } from "../utils-std-ts/logger";
import { FileDBUtils } from "./fileDbUtils";

const logger = new Logger("data/taskExecution");

export class TaskExecutions {
  //
  public taskExecutions: TaskExecution[];

  public async load(context: Span): Promise<void> {
    this.taskExecutions = await FileDBUtils.load(context, "task-executions", []);
  }

  public async get(context: Span, id: string): Promise<TaskExecution> {
    return TaskExecution.fromJson(
      _.find(this.taskExecutions, {
        id,
      })
    );
  }

  public async delete(context: Span, id: string): Promise<void> {
    const span = StandardTracer.startSpan("TaskExecutions_delete", context);
    const position = _.findIndex(this.taskExecutions, {
      id,
    });
    if (position >= 0) {
      await this.deleteLogs(span, this.taskExecutions[position].taskId, id);
      this.taskExecutions.splice(position, 1);
    }
    await this.save(span);
    span.end();
  }

  public async list(context: Span): Promise<TaskExecution[]> {
    return this.taskExecutions;
  }

  public async update(context: Span, id: string, taskExecutionUpdate: TaskExecution): Promise<void> {
    const span = StandardTracer.startSpan("TaskExecutions_update", context);
    const taskExecution = _.find(this.taskExecutions, {
      id,
    });
    taskExecution.status = taskExecutionUpdate.status;
    taskExecution.success = taskExecutionUpdate.success;
    taskExecution.agentId = taskExecutionUpdate.agentId;
    taskExecution.dateQueued = taskExecutionUpdate.dateQueued;
    taskExecution.dateExecuting = taskExecutionUpdate.dateExecuting;
    taskExecution.dateExecuted = taskExecutionUpdate.dateExecuted;
    taskExecution.dateAgentAlive = taskExecutionUpdate.dateAgentAlive;
    taskExecution.outputs = taskExecutionUpdate.outputs;
    await this.save(span);
    if (taskExecution.status === TaskExecutionStatus.executed) {
      // Delay to wait for the log to be stable
      setTimeout(async () => {
        taskExecution.outputs = [];
        const task = await AppContext.getTasks().get(span, taskExecution.taskId);
        const logs = await this.getLogs(span, taskExecution.id, taskExecution.taskId);
        for (const outputDefinition of task.outputDefinitions) {
          try {
            const regex = new RegExp(outputDefinition.pattern);
            const match = regex.exec(logs.toString());
            if (match && match.length > 1) {
              const taskOutput = new TaskOutput();
              taskOutput.name = outputDefinition.name;
              taskOutput.value = match[1];
              taskOutput.taskOutputDefinitionId = outputDefinition.id;
              taskExecution.outputs.push(taskOutput);
            }
            await this.save(span);
          } catch (error) {
            span.recordException(error);
            logger.error(`Output Pattern Matching Failed: ${error}`);
          }
        }
      }, 1000);
    }
  }

  public async createFromTaskId(context: Span, taskId: string): Promise<TaskExecution> {
    const span = StandardTracer.startSpan("TaskExecutions_createFromTaskId", context);
    const task = await AppContext.getTasks().get(span, taskId);
    const newTaskExecution = new TaskExecution();
    newTaskExecution.taskId = taskId;
    newTaskExecution.script = task.script;
    newTaskExecution.tag = task.tag;
    newTaskExecution.status = TaskExecutionStatus.queued;
    newTaskExecution.dateQueued = new Date();
    this.taskExecutions.push(newTaskExecution);
    await this.save(span);
    span.end();
    return newTaskExecution;
  }

  public async getLogs(context: Span, id: string, taskId: string): Promise<Buffer> {
    if (fs.existsSync(`${AppContext.getConfig().DATA_DIR}/logs/${taskId}_${id}.log`)) {
      return await fs.readFile(`${AppContext.getConfig().DATA_DIR}/logs/${taskId}_${id}.log`);
    } else {
      return Buffer.from("");
    }
  }

  public async deleteLogs(context: Span, id: string, taskId: string): Promise<void> {
    if (fs.existsSync(`${AppContext.getConfig().DATA_DIR}/logs/${taskId}_${id}.log`)) {
      await fs.remove(`${AppContext.getConfig().DATA_DIR}/logs/${taskId}_${id}.log`);
    }
  }

  public async updateLogs(context: Span, taskExecutionId: string, taskId: string, logs: Buffer): Promise<void> {
    const span = StandardTracer.startSpan("TaskExecutions_updateLogs", context);
    await fs.ensureDir(`${AppContext.getConfig().DATA_DIR}/logs`);
    await fs.writeFile(`${AppContext.getConfig().DATA_DIR}/logs/${taskId}_${taskExecutionId}.log`, logs);
    span.end();
  }

  public async save(context: Span): Promise<void> {
    await FileDBUtils.save(context, "task-executions", this.taskExecutions);
  }
}
