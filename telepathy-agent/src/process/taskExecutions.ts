import axios from "axios";
import * as _ from "lodash";
import { Auth } from "./auth";
import { TaskExecution } from "../common-model/taskExecution";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { Logger } from "../utils-std-ts/logger";
import { Timeout } from "../utils-std-ts/timeout";
import { ChildProcess, exec } from "child_process";
import { AppContext } from "../appContext";
import { StandardTracer } from "../utils-std-ts/standardTracer";
import { Span } from "@opentelemetry/sdk-trace-base";
import { SpanStatusCode } from "@opentelemetry/api";

const logger = new Logger("tasks/taskExecutions");

export class TaskExecutions {
  //
  public static async check(): Promise<void> {
    const span = StandardTracer.startSpan("TaskExecutions_check");
    await axios
      .get(
        `${AppContext.getConfig().SERVER}/agents/${AppContext.getConfig().AGENT_ID}/tasks/executions`,
        await Auth.getAuthHeader(span)
      )
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
    await Timeout.wait(AppContext.getConfig().HEARTBEAT_CYCLE * 1000);
    TaskExecutions.check();
  }

  private static async processExecution(taskExecution: TaskExecution): Promise<void> {
    const span = StandardTracer.startSpan("TaskExecutions_processExecution");
    span.setAttribute("process", "TaskExecutions_processExecution");
    span.setAttribute("taskExecution", taskExecution.id);
    taskExecution.status = TaskExecutionStatus.executing;
    taskExecution.agentId = AppContext.getConfig().AGENT_ID;
    taskExecution.dateExecuting = new Date();
    await axios.put(
      `${AppContext.getConfig().SERVER}/tasks/${taskExecution.taskId}/executions/agent/${taskExecution.id}`,
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
        `${AppContext.getConfig().SERVER}/tasks/${taskExecution.taskId}/executions/agent/${taskExecution.id}/logs`,
        { logs: outputRaw },
        await Auth.getAuthHeader(span)
      );
    });

    command.stderr.on("data", async (data) => {
      outputRaw += data;
      await axios.put(
        `${AppContext.getConfig().SERVER}/tasks/${taskExecution.taskId}/executions/agent/${taskExecution.id}/logs`,
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
        `${AppContext.getConfig().SERVER}/tasks/${taskExecution.taskId}/executions/agent/${taskExecution.id}/logs`,
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
        `${AppContext.getConfig().SERVER}/tasks/${taskExecution.taskId}/executions/agent/${taskExecution.id}`,
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
    const span = StandardTracer.startSpan("TaskExecutions_monitorTaskExecutionDefinition", context);
    const taskExecutionServerDefinition = (
      await axios.get(
        `${AppContext.getConfig().SERVER}/tasks/${taskExecution.taskId}/executions/agent/${taskExecution.id}`,
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
      }, AppContext.getConfig().TASK_ALIVE_FREQUENCY * 1000);
    }
  }
}
