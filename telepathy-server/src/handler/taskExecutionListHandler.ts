import * as _ from "lodash";
import { AppContext } from "../appContext";
import { TaskExecution } from "../common-model/taskExecution";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/handlers/taskExecutionListHandler");

export class TaskExecutionListHandler {
  //
  public static async list(req, res, next, stopAndSend): Promise<void> {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    AppContext.getTaskExecutions();
    const tasksExecutions = await AppContext.getTaskExecutions().list();
    const output: TaskExecution[] = [];
    for (const tasksExecution of tasksExecutions) {
      if (tasksExecution.taskId === req.params.taskId) {
        output.push(tasksExecution);
      }
    }
    const outputSorted = _.reverse(_.sortBy(output, "dateQueued"));
    res.status(200).json({ task_executions: outputSorted });
  }

  public static async create(req, res, next, stopAndSend): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    AppContext.getTaskExecutions();
    const task = await AppContext.getTasks().get(req.params.taskId);
    const newTaskExecution = new TaskExecution();
    newTaskExecution.taskId = req.params.taskId;
    newTaskExecution.script = task.script;
    newTaskExecution.tag = task.tag;
    newTaskExecution.status = TaskExecutionStatus.queued;
    await AppContext.getTaskExecutions().add(newTaskExecution);
    res.status(201).json(newTaskExecution);
  }
}
