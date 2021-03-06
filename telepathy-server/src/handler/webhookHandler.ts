import * as _ from "lodash";
import { AppContext } from "../appContext";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/handlers/webhookHandler");

export class WebhookHandler {
  //
  public static async trigger(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    const tasks = await AppContext.getTasks().list();
    const task = _.find(tasks, {
      webhook: req.params.webhookId,
    });
    if (!task) {
      stopAndSend(404, { error: "Not Found" });
    }
    const newTaskExecution = await AppContext.getTaskExecutions().createFromTaskId(task.id);
    res.status(201).json(newTaskExecution.toJson());
  }
}
