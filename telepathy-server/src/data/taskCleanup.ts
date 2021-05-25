import * as _ from "lodash";
import { AppContext } from "../appContext";
import { Logger } from "../utils-std-ts/logger";
import { Timeout } from "../utils-std-ts/timeout";

const logger = new Logger("data/taskCleanup");

export class TaskCleanup {
  //
  public static async start(): Promise<void> {
    logger.info("Start Task execution maintenance");
    while (true) {
      await cleanByDate().catch((error) => {
        logger.error(error);
      });
      await cleanByCount().catch((error) => {
        logger.error(error);
      });
      await Timeout.wait(1000 * 60 * 60);
    }
  }
}

async function cleanByDate(): Promise<void> {
  const taskExecutions = await AppContext.getTaskExecutions().list();
  for (const taskExecution of taskExecutions) {
    if (!taskExecution.dateQueued) {
      logger.info(`Clean task execution: ${taskExecution.id}`);
      await AppContext.getTaskExecutions().delete(taskExecution.id);
    }
    const taskAge = (new Date().getTime() - new Date(taskExecution.dateQueued).getTime()) / (1000 * 60 * 60 * 24);
    if (taskAge > AppContext.getConfig().TASK_HISTORY_MAX_AGE_DAYS) {
      logger.info(`Clean task execution: ${taskExecution.id}`);
      await AppContext.getTaskExecutions().delete(taskExecution.id);
    }
  }
}

async function cleanByCount(): Promise<void> {
  const taskExecutions = await AppContext.getTaskExecutions().list();
  const tasks = await AppContext.getTasks().list();

  for (const task of tasks) {
    const currentTaskExecutions = _.sortBy(_.filter(taskExecutions, { taskId: task.id }), "dateQueued");
    if (currentTaskExecutions.length > AppContext.getConfig().TASK_HISTORY_MAX_COUNT) {
      const nbToDelete = currentTaskExecutions.length - AppContext.getConfig().TASK_HISTORY_MAX_COUNT;
      logger.info(`Task ${task.id} as ${currentTaskExecutions.length} execution (${nbToDelete} to delete)`);
      for (let i = 0; i < nbToDelete; i++) {
        logger.info(`Clean task execution: ${currentTaskExecutions[i].id}`);
        await AppContext.getTaskExecutions().delete(currentTaskExecutions[i].id);
      }
    }
  }
}
