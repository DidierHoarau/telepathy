import * as _ from "lodash";
import { AppContext } from "../appContext";
import { Agent } from "../common-model/agent";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { User } from "../common-model/user";
import { Auth } from "../data/auth";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/handlers/agentHandler");

export class AgentHandler {
  //
  public static async authenticate(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.body.key) {
      stopAndSend(400, { error: "Missing: Key" });
    } else if (req.body.key !== AppContext.getConfig().AGENT_KEY) {
      stopAndSend(403, { error: "Access Denied" });
    } else {
      const agent = new Agent(req.params.agentId);
      if (req.body.tags) {
        agent.tags = req.body.tags;
      }
      await AppContext.getAgents().register(agent);
      const userAgent = new User();
      userAgent.name = req.params.agentId;
      res.status(201).json({ success: true, token: await Auth.generateJWT(userAgent) });
    }
  }

  public static async assignTasks(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const taskExecutionsQueued = _.filter(await AppContext.getTaskExecutions().list(), {
      status: TaskExecutionStatus.queued,
    });
    const agent = await AppContext.getAgents().get(req.params.agentId);
    const taskExecutionCompatible = [];
    for (const taskExecution of taskExecutionsQueued) {
      if (!taskExecution.tag || agent.tags.indexOf(taskExecution.tag) >= 0) {
        taskExecutionCompatible.push(taskExecution);
      }
    }
    res.status(201).json({
      agent_registered: true,
      task_executions: taskExecutionCompatible,
    });
  }
}
