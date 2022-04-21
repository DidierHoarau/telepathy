import { AppContext } from "../appContext";
import { TaskExecution } from "../common-model/taskExecution";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/handlers/taskExecutionHandler");

export class TaskExecutionHandler {
  //
  public static async get(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const taskExecution = await AppContext.getTaskExecutions().get(req.params.taskExecutionId);
    res.status(200).json(taskExecution.toJson());
  }

  public static async update(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const taskExecutionUpdate = TaskExecution.fromJson(req.body);
    await AppContext.getTaskExecutions().update(req.params.taskExecutionId, taskExecutionUpdate);
    res.status(200).json({});
  }

  public static async cancel(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const taskExecution = await AppContext.getTaskExecutions().get(req.params.taskExecutionId);
    taskExecution.status = TaskExecutionStatus.cancelling;
    await AppContext.getTaskExecutions().update(req.params.taskExecutionId, taskExecution);
    res.status(202).json({});
  }

  public static async getFromAgent(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const taskExecution = await AppContext.getTaskExecutions().get(req.params.taskExecutionId);
    taskExecution.dateAgentAlive = new Date();
    await AppContext.getTaskExecutions().update(req.params.taskExecutionId, taskExecution);
    res.status(200).json(taskExecution);
  }
}
