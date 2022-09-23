import { Span } from "@opentelemetry/sdk-trace-base";
import * as _ from "lodash";
import { AppContext } from "../appContext";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { StandardTracer } from "../utils-std-ts/standardTracer";
import { Logger } from "../utils-std-ts/logger";
import { Timeout } from "../utils-std-ts/timeout";

const logger = new Logger("data/taskCleanup");

export class TaskCleanup {
  //
  public static async startMaintenance(): Promise<void> {
    const span = StandardTracer.startSpan("TaskCleanup_startMaintenance");
    logger.info("Start Task execution maintenance");
    await cleanByDate(span).catch((error) => {
      logger.error(error);
    });
    await cleanByCount(span).catch((error) => {
      logger.error(error);
    });
    span.end();
    await Timeout.wait(1000 * 60 * 60);
    TaskCleanup.startMaintenance();
  }

  public static async monitorTimeouts(): Promise<void> {
    const span = StandardTracer.startSpan("TaskCleanup_monitorTimeouts");
    await cleanTimedOut(span).catch((error) => {
      logger.error(error);
    });
    span.end();
    await Timeout.wait(AppContext.getConfig().TASK_ALIVE_TIMEOUT * 1000);
    TaskCleanup.monitorTimeouts();
  }
}

async function cleanByDate(context: Span): Promise<void> {
  const span = StandardTracer.startSpan("TaskCleanup_cleanByDate", context);
  const taskExecutions = await AppContext.getTaskExecutions().list(span);
  for (const taskExecution of taskExecutions) {
    if (!taskExecution.dateQueued) {
      logger.info(`Clean task execution: ${taskExecution.id}`);
      await AppContext.getTaskExecutions().delete(span, taskExecution.id);
    }
    const taskAge = (new Date().getTime() - new Date(taskExecution.dateQueued).getTime()) / (1000 * 60 * 60 * 24);
    if (taskAge > AppContext.getConfig().TASK_HISTORY_MAX_AGE_DAYS) {
      logger.info(`Clean task execution: ${taskExecution.id}`);
      await AppContext.getTaskExecutions().delete(span, taskExecution.id);
    }
  }
  span.end();
}

async function cleanByCount(context: Span): Promise<void> {
  const span = StandardTracer.startSpan("TaskCleanup_cleanByCount", context);
  const taskExecutions = await AppContext.getTaskExecutions().list(span);
  const tasks = await AppContext.getTasks().list(span);
  for (const task of tasks) {
    const currentTaskExecutions = _.sortBy(_.filter(taskExecutions, { taskId: task.id }), "dateQueued");
    if (currentTaskExecutions.length > AppContext.getConfig().TASK_HISTORY_MAX_COUNT) {
      const nbToDelete = currentTaskExecutions.length - AppContext.getConfig().TASK_HISTORY_MAX_COUNT;
      logger.info(`Task ${task.id} as ${currentTaskExecutions.length} execution (${nbToDelete} to delete)`);
      for (let i = 0; i < nbToDelete; i++) {
        logger.info(`Clean task execution: ${currentTaskExecutions[i].id}`);
        await AppContext.getTaskExecutions().delete(span, currentTaskExecutions[i].id);
      }
    }
  }
  span.end();
}

async function cleanTimedOut(context: Span): Promise<void> {
  const span = StandardTracer.startSpan("TaskCleanup_cleanTimedOut", context);
  const taskExecutions = await AppContext.getTaskExecutions().list(span);
  for (const taskExecution of taskExecutions) {
    if (
      taskExecution.version > 1 &&
      (taskExecution.status === TaskExecutionStatus.executing ||
        taskExecution.status === TaskExecutionStatus.cancelling) &&
      (!taskExecution.dateAgentAlive ||
        (new Date().getTime() - new Date(taskExecution.dateAgentAlive).getTime()) / 1000 >
          AppContext.getConfig().TASK_ALIVE_TIMEOUT)
    ) {
      logger.info(`Task Execution Timed Out: ${taskExecution.taskId}/${taskExecution.id}`);
      taskExecution.status = TaskExecutionStatus.failed;
      await AppContext.getTaskExecutions().update(span, taskExecution.id, taskExecution);
    }
  }
  span.end();
}
