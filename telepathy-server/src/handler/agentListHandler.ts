import { AppContext } from "../appContext";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/handlers/agentListHandler");

export class AgentListHandler {
  //
  public static async get(req, res, next, stopAndSend): Promise<void> {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const agents = await AppContext.getAgents().list();
    res.status(200).json({
      agents,
    });
  }

  public static async listTags(req, res, next, stopAndSend): Promise<void> {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const agents = await AppContext.getAgents().list();
    const tags = [];
    for (const agent of agents) {
      for (const tag of agent.tags) {
        if (tags.indexOf(tag) < 0) {
          tags.push(tag);
        }
      }
    }
    res.status(200).json(tags);
  }
}
