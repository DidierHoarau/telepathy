import * as _ from "lodash";
import { AppContext } from "../appContext";
import { TaskExecution } from "../common-model/taskExecution";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/handlers/taskListHandler");

export class WebhookHandler {
  //
  public static async trigger(req, res, next, stopAndSend): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    const tasks = await AppContext.getTasks().list();
    const task = _.find(tasks, {
      webhook: req.params.webhookId,
    });
    if (!task) {
      stopAndSend(404, { error: "Not Found" });
    }
    const newTaskExecution = new TaskExecution();
    newTaskExecution.taskId = task.id;
    newTaskExecution.script = task.script;
    newTaskExecution.status = TaskExecutionStatus.queued;
    await AppContext.getTaskExecutions().add(newTaskExecution);
    res.status(201).json(newTaskExecution.toJson());
  }
}
