import * as express from "express";
import * as _ from "lodash";
import { Agent } from "../agents/agent";
import { AppContext } from "../appContext";
import { ExpressRouterWrapper as ERW } from "../utils-std-ts/express-router-wrapper";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/agents");

export const taskApi = express.Router();

ERW.route(taskApi, "get", "/", async (req, res, next, stopAndSend) => {
  const tasks = await AppContext.getTasks().list();
  res.status(201).json({
    tasks,
  });
});
