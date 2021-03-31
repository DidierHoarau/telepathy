import * as express from "express";
import * as _ from "lodash";
import { AppContext } from "../appContext";
import { Task } from "../common-model/task";
import { TaskExecution } from "../common-model/taskExecution";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { ExpressRouterWrapper as ERW } from "../utils-std-ts/express-router-wrapper";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/taskApi");

export const taskApi = express.Router();

ERW.route(taskApi, "get", "/", async (req, res, next, stopAndSend) => {
  logger.debug(`[${req.method}] ${req.originalUrl}`);
  if (!req.user.authenticated) {
    stopAndSend(403, { error: "Access Denied" });
  }
  const tasks = await AppContext.getTasks().list();
  res.status(200).json({
    tasks,
  });
});

ERW.route(taskApi, "post", "/", async (req, res, next, stopAndSend) => {
  logger.info(`[${req.method}] ${req.originalUrl}`);
  if (!req.user.authenticated) {
    stopAndSend(403, { error: "Access Denied" });
  }
  if (!req.body.name) {
    stopAndSend(400, { error: "Missing: Name" });
  }
  if (!req.body.script) {
    stopAndSend(400, { error: "Missing: Script" });
  }
  const newTask = Task.fromJson(req.body);
  await AppContext.getTasks().add(newTask);
  res.status(201).json(newTask.toJson());
});

ERW.route(taskApi, "get", "/:taskId", async (req, res, next, stopAndSend) => {
  logger.debug(`[${req.method}] ${req.originalUrl}`);
  if (!req.user.authenticated) {
    stopAndSend(403, { error: "Access Denied" });
  }
  const task = await AppContext.getTasks().get(req.params.taskId);
  res.status(200).json(task.toJson());
});

ERW.route(
  taskApi,
  "delete",
  "/:taskId",
  async (req, res, next, stopAndSend) => {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    await AppContext.getTasks().delete(req.params.taskId);
    res.status(202).json({});
  }
);

ERW.route(taskApi, "put", "/:taskId", async (req, res, next, stopAndSend) => {
  logger.info(`[${req.method}] ${req.originalUrl}`);
  if (!req.user.authenticated) {
    stopAndSend(403, { error: "Access Denied" });
  }
  const task = await AppContext.getTasks().get(req.params.taskId);
  if (!task) {
    stopAndSend(404, { error: "Not Found" });
  }
  if (!req.body.name) {
    stopAndSend(400, { error: "Missing: Name" });
  }
  if (!req.body.script) {
    stopAndSend(400, { error: "Missing: Script" });
  }
  task.name = req.body.name;
  task.script = req.body.script;
  task.webhook = req.body.webhook;
  await AppContext.getTasks().update(req.params.taskId, task);
  res.status(201).json(task);
});

ERW.route(
  taskApi,
  "get",
  "/:taskId/executions",
  async (req, res, next, stopAndSend) => {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    AppContext.getTaskExecutions();
    const tasksExecutions = await AppContext.getTaskExecutions().list();
    const output: TaskExecution[] = [];
    for (const tasksExecution of tasksExecutions) {
      if (tasksExecution.taskId === req.params.taskId) {
        output.push(tasksExecution);
      }
    }
    const outputSorted = _.reverse(_.sortBy(output, "dateExecuted"));
    res.status(200).json({ task_executions: outputSorted });
  }
);

ERW.route(
  taskApi,
  "post",
  "/:taskId/executions",
  async (req, res, next, stopAndSend) => {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    AppContext.getTaskExecutions();
    const task = await AppContext.getTasks().get(req.params.taskId);
    const newTaskExecution = new TaskExecution();
    newTaskExecution.taskId = req.params.taskId;
    newTaskExecution.script = task.script;
    newTaskExecution.status = TaskExecutionStatus.queued;
    await AppContext.getTaskExecutions().add(newTaskExecution);
    res.status(201).json(newTaskExecution);
  }
);

ERW.route(
  taskApi,
  "get",
  "/:taskId/executions/:taskExecutionId",
  async (req, res, next, stopAndSend) => {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const taskExecution = await AppContext.getTaskExecutions().get(
      req.params.taskExecutionId
    );
    res.status(200).json(taskExecution.toJson());
  }
);

ERW.route(
  taskApi,
  "put",
  "/:taskId/executions/:taskExecutionId",
  async (req, res, next, stopAndSend) => {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const taskExecutionUpdate = TaskExecution.fromJson(req.body);
    await AppContext.getTaskExecutions().update(
      req.params.taskExecutionId,
      taskExecutionUpdate
    );
    res.status(200).json({});
  }
);

ERW.route(
  taskApi,
  "get",
  "/:taskId/executions/:taskExecutionId/logs",
  async (req, res, next, stopAndSend) => {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const logs = await AppContext.getTaskExecutions().getLogs(
      req.params.taskExecutionId,
      req.params.taskId
    );
    res.status(200).json({ logs: logs.toString() });
  }
);

ERW.route(
  taskApi,
  "put",
  "/:taskId/executions/:taskExecutionId/logs",
  async (req, res, next, stopAndSend) => {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    if (!req.body.logs) {
      stopAndSend(400, { error: "Missing: Logs" });
    }
    await AppContext.getTaskExecutions().updateLogs(
      req.params.taskExecutionId,
      req.params.taskId,
      req.body.logs
    );
    res.status(200).json({});
  }
);

ERW.route(
  taskApi,
  "post",
  "/webhooks/:webhookId",
  async (req, res, next, stopAndSend) => {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    const tasks = await AppContext.getTasks().list();
    const task = _.find(tasks, {
      webhook: req.params.webhookId,
    });
    if (!task) {
      stopAndSend(404, { error: "Not Found" });
    }
    const newTaskExecution = new TaskExecution();
    newTaskExecution.taskId = task.id;
    newTaskExecution.script = task.script;
    newTaskExecution.status = TaskExecutionStatus.queued;
    await AppContext.getTaskExecutions().add(newTaskExecution);
    res.status(201).json(newTaskExecution.toJson());
  }
);
