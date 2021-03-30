import axios from "axios";
import * as _ from "lodash";
import { Auth } from "../agents/auth";
import { TaskExecution } from "../common-model/taskExecution";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { config } from "../config";
import { Logger } from "../utils-std-ts/logger";
import { Timeout } from "../utils-std-ts/timeout";
import { exec } from "child_process";

const logger = new Logger("tasks/taskExecutions");

export class TaskExecutions {
  //
  public static check(): void {
    Promise.resolve().then(async () => {
      while (true) {
        logger.debug(`Contacting server(s)`);
        await axios
          .get(
            `${config.SERVER}/agents/${config.AGENT_ID}/tasks/executions`,
            await Auth.getAuthHeader()
          )
          .then(async (res) => {
            if (
              _.isArray(res.data.task_executions) &&
              res.data.task_executions.length > 0
            ) {
              for (const taskExecution of res.data
                .task_executions as TaskExecution[]) {
                if (taskExecution.status === TaskExecutionStatus.queued) {
                  logger.info(`New task queued: ${taskExecution.id}`);
                  await TaskExecutions.processQueued(taskExecution);
                }
              }
            }
          })
          .catch((error) => {
            logger.error(`Error processing task executions: ${error}`);
          });
        await Timeout.wait(config.HEARTBEAT_CYCLE * 1000);
      }
    });
  }

  private static async processQueued(
    taskExecution: TaskExecution
  ): Promise<void> {
    taskExecution.status = TaskExecutionStatus.executing;
    taskExecution.dateExecuting = new Date();
    await axios.put(
      `${config.SERVER}/tasks/${taskExecution.taskId}/executions/${taskExecution.id}`,
      taskExecution,
      await Auth.getAuthHeader()
    );

    const command = exec(taskExecution.script);

    command.stdout.on("data", async (data) => {
      taskExecution.outputRaw += data;
      await axios.put(
        `${config.SERVER}/tasks/${taskExecution.taskId}/executions/${taskExecution.id}`,
        taskExecution,
        await Auth.getAuthHeader()
      );
    });

    command.stderr.on("data", async (data) => {
      taskExecution.outputRaw += data;
      await axios.put(
        `${config.SERVER}/tasks/${taskExecution.taskId}/executions/${taskExecution.id}`,
        taskExecution,
        await Auth.getAuthHeader()
      );
    });

    command.on("error", async (error) => {
      logger.info(error.message);
      taskExecution.outputRaw += error.message;
      await axios.put(
        `${config.SERVER}/tasks/${taskExecution.taskId}/executions/${taskExecution.id}`,
        taskExecution,
        await Auth.getAuthHeader()
      );
    });

    command.on("close", async (code) => {
      logger.info(`Command executed with code: ${code}`);
      taskExecution.dateExecuted = new Date();
      taskExecution.success = true;
      taskExecution.status = TaskExecutionStatus.executed;
      await axios.put(
        `${config.SERVER}/tasks/${taskExecution.taskId}/executions/${taskExecution.id}`,
        taskExecution,
        await Auth.getAuthHeader()
      );
    });
  }
}
