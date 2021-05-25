import { AppContext } from "../appContext";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/handlers/taskExecutionLogHandler");

export class TaskExecutionLogHandler {
  //
  public static async get(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const logs = await AppContext.getTaskExecutions().getLogs(req.params.taskExecutionId, req.params.taskId);
    res.status(200).json({ logs: logs.toString() });
  }

  public static async update(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    if (!req.body.logs) {
      stopAndSend(400, { error: "Missing: Logs" });
    }
    await AppContext.getTaskExecutions().updateLogs(req.params.taskExecutionId, req.params.taskId, req.body.logs);
    res.status(200).json({});
  }
}
