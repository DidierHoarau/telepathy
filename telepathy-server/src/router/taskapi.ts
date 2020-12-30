import * as express from 'express';
import * as _ from 'lodash';
import { AppContext } from '../appContext';
import { Task } from '../common-model/task';
import { TaskExecution } from '../common-model/taskExecution';
import { TaskExecutionStatus } from '../common-model/taskExecutionStatus';
import { ExpressRouterWrapper as ERW } from '../utils-std-ts/express-router-wrapper';
import { Logger } from '../utils-std-ts/logger';

const logger = new Logger('router/taskApi');

export const taskApi = express.Router();

ERW.route(taskApi, 'get', '/', async (req, res, next, stopAndSend) => {
  logger.debug(`[${req.method}] ${req.originalUrl}`);
  const tasks = await AppContext.getTasks().list();
  res.status(200).json({
    tasks,
  });
});

ERW.route(taskApi, 'post', '/', async (req, res, next, stopAndSend) => {
  logger.info(`[${req.method}] ${req.originalUrl}`);
  const newTask = new Task();
  if (!req.body.name) {
    stopAndSend(400, { error: 'Missing: Name' });
  }
  if (!req.body.script) {
    stopAndSend(400, { error: 'Missing: Script' });
  }
  newTask.name = req.body.name;
  newTask.script = req.body.script;
  await AppContext.getTasks().add(newTask);
  res.status(201).json(newTask);
});

ERW.route(
  taskApi,
  'get',
  '/:taskId/executions',
  async (req, res, next, stopAndSend) => {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    const taskId = req.params.taskId;
    AppContext.getTaskExecutions();
    const tasksExecutions = await AppContext.getTaskExecutions().list();
    const output: TaskExecution[] = [];
    for (const tasksExecution of tasksExecutions) {
      if (tasksExecution.taskId === taskId) {
        output.push(tasksExecution);
      }
    }
    const outputSorted = _.reverse(_.sortBy(output, 'dateExecuted'));
    res.status(201).json({ task_executions: outputSorted });
  }
);

ERW.route(
  taskApi,
  'post',
  '/:taskId/executions',
  async (req, res, next, stopAndSend) => {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    const taskId = req.params.taskId;
    AppContext.getTaskExecutions();
    const task = await AppContext.getTasks().get(taskId);
    const newTaskExecution = new TaskExecution();
    newTaskExecution.taskId = taskId;
    newTaskExecution.script = task.script;
    newTaskExecution.status = TaskExecutionStatus.queued;
    await AppContext.getTaskExecutions().add(newTaskExecution);
    res.status(201).json(newTaskExecution);
  }
);

ERW.route(
  taskApi,
  'put',
  '/:taskId/executions/:taskExecutionId',
  async (req, res, next, stopAndSend) => {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    const taskExecutionUpdate = req.body as TaskExecution;
    const taskExecutionId = req.params.taskExecutionId;
    await AppContext.getTaskExecutions().update(
      taskExecutionId,
      taskExecutionUpdate
    );
    res.status(200).json({});
  }
);
