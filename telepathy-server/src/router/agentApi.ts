import * as express from "express";
import * as _ from "lodash";
import { AgentHandler } from "../handler/agentHandler";
import { AgentListHandler } from "../handler/agentListHandler";
import { ExpressRouterWrapper as ERW } from "../utils-std-ts/express-router-wrapper";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/agentApi");

export const agentApi = express.Router();

ERW.route(agentApi, "get", "/", AgentListHandler.get);

ERW.route(agentApi, "get", "/tags", AgentListHandler.listTags);

ERW.route(agentApi, "post", "/:agentId/session", AgentHandler.authenticate);

ERW.route(agentApi, "get", "/:agentId/tasks/executions", AgentHandler.assignTasks);
