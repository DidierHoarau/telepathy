import * as fs from "fs-extra";
import * as _ from "lodash";
import { AppContext } from "../appContext";
import { TaskExecution } from "../common-model/taskExecution";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { TaskOutput } from "../common-model/taskOutput";
import { config } from "../config";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("data/taskExecution");

export class TaskExecutions {
  //
  public taskExecutions: TaskExecution[];

  constructor() {
    if (fs.existsSync(`${config.DATA_DIR}/task-executions.json`)) {
      fs.readJSON(`${config.DATA_DIR}/task-executions.json`).then((data) => {
        this.taskExecutions = data;
      });
    } else {
      this.taskExecutions = [];
      this.save();
    }
  }

  public async get(id: string): Promise<TaskExecution> {
    return TaskExecution.fromJson(
      _.find(this.taskExecutions, {
        id,
      })
    );
  }

  public async delete(id: string): Promise<void> {
    const position = _.findIndex(this.taskExecutions, {
      id,
    });
    if (position >= 0) {
      await this.deleteLogs(this.taskExecutions[position].taskId, id);
      this.taskExecutions.splice(position, 1);
    }
    await this.save();
  }

  public async list(): Promise<TaskExecution[]> {
    return this.taskExecutions;
  }

  public async update(id: string, taskExecutionUpdate: TaskExecution): Promise<void> {
    const taskExecution = _.find(this.taskExecutions, {
      id,
    });
    taskExecution.status = taskExecutionUpdate.status;
    taskExecution.success = taskExecutionUpdate.success;
    taskExecution.agentId = taskExecutionUpdate.agentId;
    taskExecution.dateQueued = taskExecutionUpdate.dateQueued;
    taskExecution.dateExecuting = taskExecutionUpdate.dateExecuting;
    taskExecution.dateExecuted = taskExecutionUpdate.dateExecuted;
    taskExecution.outputs = taskExecutionUpdate.outputs;
    await this.save();
    if (taskExecution.status === TaskExecutionStatus.executed) {
      // Delay to wait for the log to be stable
      setTimeout(async () => {
        const task = await AppContext.getTasks().get(taskExecution.taskId);
        const logs = await this.getLogs(taskExecution.id, taskExecution.taskId);
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
            this.save();
          } catch (error) {
            logger.error(`Output Pattern Matching Failed: ${error}`);
          }
        }
      }, 1000);
    }
  }

  public async createFromTaskId(taskId: string): Promise<TaskExecution> {
    const task = await AppContext.getTasks().get(taskId);
    const newTaskExecution = new TaskExecution();
    newTaskExecution.taskId = taskId;
    newTaskExecution.script = task.script;
    newTaskExecution.tag = task.tag;
    newTaskExecution.status = TaskExecutionStatus.queued;
    newTaskExecution.dateQueued = new Date();
    this.taskExecutions.push(newTaskExecution);
    await this.save();
    return newTaskExecution;
  }

  public async getLogs(id: string, taskId: string): Promise<Buffer> {
    if (fs.existsSync(`${config.DATA_DIR}/logs/${taskId}_${id}.log`)) {
      return await fs.readFile(`${config.DATA_DIR}/logs/${taskId}_${id}.log`);
    } else {
      return Buffer.from("");
    }
  }

  public async deleteLogs(id: string, taskId: string): Promise<void> {
    if (fs.existsSync(`${config.DATA_DIR}/logs/${taskId}_${id}.log`)) {
      await fs.remove(`${config.DATA_DIR}/logs/${taskId}_${id}.log`);
    }
  }

  public async updateLogs(taskExecutionId: string, taskId: string, logs: Buffer): Promise<void> {
    await fs.ensureDir(`${config.DATA_DIR}/logs`);
    await fs.writeFile(`${config.DATA_DIR}/logs/${taskId}_${taskExecutionId}.log`, logs);
  }

  public async save(): Promise<void> {
    await fs.writeJSON(`${config.DATA_DIR}/task-executions.json`, this.taskExecutions);
  }
}
