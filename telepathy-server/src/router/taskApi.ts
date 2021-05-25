import * as express from "express";
import { TaskExecutionHandler } from "../handler/taskExecutionHandler";
import { TaskExecutionListHandler } from "../handler/taskExecutionListHandler";
import { TaskExecutionLogHandler } from "../handler/taskExecutionLogHandler";
import { TaskHandler } from "../handler/taskHandler";
import { TaskListHandler } from "../handler/taskListHandler";
import { WebhookHandler } from "../handler/webhookHandler";
import { ExpressRouterWrapper as ERW } from "../utils-std-ts/express-router-wrapper";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/taskApi");

export const taskApi = express.Router();

ERW.route(taskApi, "get", "/", TaskListHandler.getTasks);

ERW.route(taskApi, "post", "/", TaskListHandler.createTask);

ERW.route(taskApi, "get", "/:taskId", TaskHandler.getTask);

ERW.route(taskApi, "delete", "/:taskId", TaskHandler.deleteTask);

ERW.route(taskApi, "put", "/:taskId", TaskHandler.updateTask);

ERW.route(taskApi, "get", "/:taskId/executions", TaskExecutionListHandler.list);

ERW.route(taskApi, "post", "/:taskId/executions", TaskExecutionListHandler.create);

ERW.route(taskApi, "get", "/:taskId/executions/:taskExecutionId", TaskExecutionHandler.get);

ERW.route(taskApi, "put", "/:taskId/executions/:taskExecutionId", TaskExecutionHandler.update);

ERW.route(taskApi, "get", "/:taskId/executions/:taskExecutionId/logs", TaskExecutionLogHandler.get);

ERW.route(taskApi, "put", "/:taskId/executions/:taskExecutionId/logs", TaskExecutionLogHandler.update);

ERW.route(taskApi, "post", "/webhooks/:webhookId", WebhookHandler.trigger);
