import { AppContext } from "../appContext";
import { Task } from "../common-model/task";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/handlers/taskHandler");

export class TaskHandler {
  //
  public static async getTask(req, res, next, stopAndSend): Promise<void> {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const task = await AppContext.getTasks().get(req.params.taskId);
    res.status(200).json(task.toJson());
  }

  public static async deleteTask(req, res, next, stopAndSend): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    await AppContext.getTasks().delete(req.params.taskId);
    res.status(202).json({});
  }

  public static async updateTask(req, res, next, stopAndSend): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const task = await AppContext.getTasks().get(req.params.taskId);
    if (!task) {
      stopAndSend(404, { error: "Not Found" });
    }
    if (!req.body.name) {
      stopAndSend(400, { error: "Missing: Name" });
    }
    if (!req.body.script) {
      stopAndSend(400, { error: "Missing: Script" });
    }
    task.name = req.body.name;
    task.script = req.body.script;
    task.webhook = req.body.webhook;
    await AppContext.getTasks().update(req.params.taskId, task);
    res.status(201).json(task);
  }
}