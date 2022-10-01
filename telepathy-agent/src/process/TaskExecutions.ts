import axios from "axios";
import * as _ from "lodash";
import { Auth } from "./Auth";
import { TaskExecution } from "../common-model/TaskExecution";
import { TaskExecutionStatus } from "../common-model/TaskExecutionStatus";
import { Logger } from "../utils-std-ts/Logger";
import { Timeout } from "../utils-std-ts/Timeout";
import { ChildProcess, exec } from "child_process";
import { StandardTracer } from "../utils-std-ts/StandardTracer";
import { Span } from "@opentelemetry/sdk-trace-base";
import { SpanStatusCode } from "@opentelemetry/api";
import { Config } from "../Config";

const logger = new Logger("tasks/taskExecutions");
let config: Config;

export class TaskExecutions {
  //
  public static init(configIn: Config) {
    config = configIn;
  }

  public static async check(): Promise<void> {
    const span = StandardTracer.startSpan("TaskExecutions_check");
    await axios
      .get(`${config.SERVER}/agents/${config.AGENT_ID}/tasks/executions`, await Auth.getAuthHeader(span))
      .then(async (res) => {
        if (_.isArray(res.data.task_executions) && res.data.task_executions.length > 0) {
          for (const taskExecution of res.data.task_executions as TaskExecution[]) {
            if (taskExecution.status === TaskExecutionStatus.queued) {
              logger.info(`New task queued: ${taskExecution.id}`);
              await TaskExecutions.processExecution(taskExecution);
            }
          }
        }
      })
      .catch((error) => {
        logger.error(`Error processing task executions: ${error}`);
      });
    span.end();
    await Timeout.wait(config.HEARTBEAT_CYCLE * 1000);
    TaskExecutions.check();
  }

  private static async processExecution(taskExecution: TaskExecution): Promise<void> {
    const span = StandardTracer.startSpan("TaskExecutions_processExecution");
    span.setAttribute("process", "TaskExecutions_processExecution");
    span.setAttribute("taskExecution", taskExecution.id);
    taskExecution.status = TaskExecutionStatus.executing;
    taskExecution.agentId = config.AGENT_ID;
    taskExecution.dateExecuting = new Date();
    await axios.put(
      `${config.SERVER}/tasks/${taskExecution.taskId}/executions/agent/${taskExecution.id}`,
      taskExecution,
      await Auth.getAuthHeader(span)
    );

    const command = exec(taskExecution.script);
    let finalStatus = TaskExecutionStatus.executed;

    this.monitorTaskExecutionDefinition(span, taskExecution, command, () => {
      span.setAttribute("TaskExecutionStatus", TaskExecutionStatus.cancelled);
      finalStatus = TaskExecutionStatus.cancelled;
    });

    let outputRaw = "";
    command.stdout.on("data", async (data) => {
      outputRaw += data;
      await axios.put(
        `${config.SERVER}/tasks/${taskExecution.taskId}/executions/agent/${taskExecution.id}/logs`,
        { logs: outputRaw },
        await Auth.getAuthHeader(span)
      );
    });

    command.stderr.on("data", async (data) => {
      outputRaw += data;
      await axios.put(
        `${config.SERVER}/tasks/${taskExecution.taskId}/executions/agent/${taskExecution.id}/logs`,
        { logs: outputRaw },
        await Auth.getAuthHeader(span)
      );
    });

    command.on("error", async (error) => {
      logger.info(error.message);
      outputRaw += error.message;
      taskExecution.dateExecuted = new Date();
      taskExecution.success = false;
      finalStatus = TaskExecutionStatus.failed;
      span.setAttribute("TaskExecutionStatus", TaskExecutionStatus.failed);
      span.status.code = SpanStatusCode.ERROR;
      await axios.put(
        `${config.SERVER}/tasks/${taskExecution.taskId}/executions/agent/${taskExecution.id}/logs`,
        { logs: outputRaw },
        await Auth.getAuthHeader(span)
      );
    });

    command.on("close", async (code) => {
      logger.info(`Command executed with code: ${code}`);
      taskExecution.dateExecuted = new Date();
      taskExecution.success = true;
      taskExecution.status = finalStatus;
      await axios.put(
        `${config.SERVER}/tasks/${taskExecution.taskId}/executions/agent/${taskExecution.id}`,
        taskExecution,
        await Auth.getAuthHeader(span)
      );
      span.end();
    });
  }

  private static async monitorTaskExecutionDefinition(
    context: Span,
    taskExecution: TaskExecution,
    command: ChildProcess,
    onCancelled: any
  ): Promise<void> {
    if (taskExecution.dateExecuted) {
      return;
    }
    const span = StandardTracer.startSpan("TaskExecutions_monitorTaskExecutionDefinition", context);
    const taskExecutionServerDefinition = (
      await axios.get(
        `${config.SERVER}/tasks/${taskExecution.taskId}/executions/agent/${taskExecution.id}`,
        await Auth.getAuthHeader(span)
      )
    ).data;
    if (taskExecutionServerDefinition.status === TaskExecutionStatus.cancelling) {
      logger.info("Cancelling Task Execution");
      onCancelled();
      process.kill(command.pid, "SIGINT");
    }
    span.end();
    if (
      taskExecutionServerDefinition.status === TaskExecutionStatus.executing ||
      taskExecutionServerDefinition.status === TaskExecutionStatus.cancelling
    ) {
      setTimeout(() => {
        this.monitorTaskExecutionDefinition(context, taskExecution, command, onCancelled);
      }, config.TASK_ALIVE_FREQUENCY * 1000);
    }
  }
}
