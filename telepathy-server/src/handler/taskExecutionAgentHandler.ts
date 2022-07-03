import { AppContext } from "../appContext";
import { TaskExecution } from "../common-model/taskExecution";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/handlers/taskExecutionHandler");

export class TaskExecutionAgentHandler {
  //
  public static async update(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const taskExecutionUpdate = TaskExecution.fromJson(req.body);
    await AppContext.getTaskExecutions().update(req.params.taskExecutionId, taskExecutionUpdate);
    res.status(200).json({});
  }

  public static async get(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const taskExecution = await AppContext.getTaskExecutions().get(req.params.taskExecutionId);
    taskExecution.dateAgentAlive = new Date();
    await AppContext.getTaskExecutions().update(req.params.taskExecutionId, taskExecution);
    res.status(200).json(taskExecution);
  }

  public static async updateLog(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    if (!req.body.logs) {
      stopAndSend(400, { error: "Missing: Logs" });
    }
    const taskExecution = await AppContext.getTaskExecutions().get(req.params.taskExecutionId);
    taskExecution.dateAgentAlive = new Date();
    await AppContext.getTaskExecutions().update(req.params.taskExecutionId, taskExecution);
    await AppContext.getTaskExecutions().updateLogs(req.params.taskExecutionId, req.params.taskId, req.body.logs);
    res.status(200).json({});
  }
}
