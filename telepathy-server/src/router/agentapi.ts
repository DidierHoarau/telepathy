import * as express from "express";
import * as _ from "lodash";
import { Agent } from "../agents/agent";
import { AppContext } from "../appContext";
import { ExpressRouterWrapper as ERW } from "../utils-std-ts/express-router-wrapper";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/agentApi");

export const agentApi = express.Router();

ERW.route(agentApi, "get", "/", async (req, res, next, stopAndSend) => {
  const agents = await AppContext.getAgents().list();
  res.status(200).json({
    agents,
  });
});

ERW.route(
  agentApi,
  "get",
  "/:agentId/tasks/executions",
  async (req, res, next, stopAndSend) => {
    const agentId = req.params.agentId;

    await AppContext.getAgents().register(new Agent(req.params.agentId));

    const taskExecutions = await AppContext.getTaskExecutions().list();

    res.status(201).json({
      agent_registered: true,
      task_executions: taskExecutions,
    });
  }
);
