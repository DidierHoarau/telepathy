import axios from 'axios';
import * as _ from 'lodash';
import { TaskExecution } from '../common-model/taskExecution';
import { TaskExecutionStatus } from '../common-model/taskExecutionStatus';
import { config } from '../config';
import { Logger } from '../utils-std-ts/logger';
import { SystemCommand } from '../utils-std-ts/system-command';
import { Timeout } from '../utils-std-ts/timeout';

const logger = new Logger('tasks/taskExecutions');

export class TaskExecutions {
  //
  public static check(): void {
    Promise.resolve().then(async () => {
      while (true) {
        logger.debug(`Contacting server(s)`);
        await axios
          .get(`${config.SERVER}/agents/${config.AGENT_ID}/tasks/executions`)
          .then(async (res) => {
            logger.debug(`Heartbeat Successful to Server: ${config.SERVER}`);
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
      taskExecution
    );

    taskExecution.outputRaw = await SystemCommand.execute(taskExecution.script);
    taskExecution.dateExecuted = new Date();
    taskExecution.success = true;
    taskExecution.status = TaskExecutionStatus.executed;

    await axios.put(
      `${config.SERVER}/tasks/${taskExecution.taskId}/executions/${taskExecution.id}`,
      taskExecution
    );
  }
}
