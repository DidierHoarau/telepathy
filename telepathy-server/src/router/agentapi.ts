import * as express from "express";
import * as _ from "lodash";
import { Agent } from "../agents/agent";
import { AppContext } from "../appContext";
import { User } from "../common-model/user";
import { config } from "../config";
import { Auth } from "../users/auth";
import { ExpressRouterWrapper as ERW } from "../utils-std-ts/express-router-wrapper";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/agentApi");

export const agentApi = express.Router();

ERW.route(agentApi, "get", "/", async (req, res, next, stopAndSend) => {
  logger.debug(`[${req.method}] ${req.originalUrl}`);
  if (!req.user.authenticated) {
    stopAndSend(403, { error: "Access Denied" });
  }
  const agents = await AppContext.getAgents().list();
  res.status(200).json({
    agents,
  });
});

ERW.route(
  agentApi,
  "post",
  "/:agentId/session",
  async (req, res, next, stopAndSend) => {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.body.key) {
      stopAndSend(400, { error: "Missing: Key" });
    } else if (req.body.key !== config.AGENT_KEY) {
      stopAndSend(403, { error: "Access Denied" });
    } else {
      const user = new User();
      user.name = req.params.agentId;
      await AppContext.getAgents().register(new Agent(req.params.agentId));
      res
        .status(201)
        .json({ success: true, token: await Auth.generateJWT(user) });
    }
  }
);

ERW.route(
  agentApi,
  "get",
  "/:agentId/tasks/executions",
  async (req, res, next, stopAndSend) => {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const taskExecutions = await AppContext.getTaskExecutions().list();
    res.status(201).json({
      agent_registered: true,
      task_executions: taskExecutions,
    });
  }
);
