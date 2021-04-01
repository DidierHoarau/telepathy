import * as cron from "node-cron";
import { AppContext } from "../appContext";
import { Task } from "../common-model/task";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/handlers/taskListHandler");

export class TaskListHandler {
  //
  public static async getTasks(req, res, next, stopAndSend): Promise<void> {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const tasks = await AppContext.getTasks().list();
    res.status(200).json({
      tasks,
    });
  }

  public static async createTask(req, res, next, stopAndSend): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    if (!req.body.name) {
      stopAndSend(400, { error: "Missing: Name" });
    }
    if (!req.body.script) {
      stopAndSend(400, { error: "Missing: Script" });
    }
    if (req.body.schedule && !cron.validate(req.body.schedule)) {
      stopAndSend(400, { error: "Invalid: Schedule" });
    }

    const newTask = Task.fromJson(req.body);
    await AppContext.getTasks().add(newTask);
    AppContext.getScheduler().calculate();
    res.status(201).json(newTask.toJson());
  }
}
