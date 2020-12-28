import * as express from "express";
import * as _ from "lodash";
import { Agent } from "../agents/agent";
import { AppContext } from "../appContext";
import { ExpressRouterWrapper as ERW } from "../utils-std-ts/express-router-wrapper";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/agents");

export const taskApi = express.Router();

ERW.route(taskApi, "get", "/", async (req, res, next, stopAndSend) => {
  const agentId = req.params.agentId;

  await AppContext.getAgentRegistration().register(
    new Agent(req.params.agentId)
  );

  res.status(201).json({
    agent_registered: true,
    tasks: AppContext.getTasks(),
  });
});
