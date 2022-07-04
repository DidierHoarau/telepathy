import * as path from "path";
import { Logger } from "../utils-std-ts/logger";
import { FastifyInstance, RequestGenericInterface } from "fastify";
import { Auth } from "../data/auth";
import { AppContext } from "../appContext";
import { TaskExecution } from "../common-model/taskExecution";

const logger = new Logger(path.basename(__filename));

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  interface GetAgentExecutionId extends RequestGenericInterface {
    Params: {
      taskId: string;
      taskExecutionId: string;
    };
  }
  fastify.get<GetAgentExecutionId>("/:taskExecutionId", async (req, res) => {
    logger.info(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    const taskExecution = await AppContext.getTaskExecutions().get(req.params.taskExecutionId);
    taskExecution.dateAgentAlive = new Date();
    await AppContext.getTaskExecutions().update(req.params.taskExecutionId, taskExecution);
    res.status(200).send(taskExecution);
  });

  interface PutAgentExecutionId extends RequestGenericInterface {
    Params: {
      taskId: string;
      taskExecutionId: string;
    };
  }
  fastify.put<PutAgentExecutionId>("/:taskExecutionId", async (req, res) => {
    logger.info(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    const taskExecutionUpdate = TaskExecution.fromJson(req.body);
    await AppContext.getTaskExecutions().update(req.params.taskExecutionId, taskExecutionUpdate);
    res.status(200).send({});
  });

  interface PutAgentExecutionIdLog extends RequestGenericInterface {
    Params: {
      taskId: string;
      taskExecutionId: string;
    };
    Body: {
      logs: Buffer;
    };
  }
  fastify.put<PutAgentExecutionIdLog>("/:taskExecutionId/logs", async (req, res) => {
    logger.info(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    if (!req.body.logs) {
      return res.status(400).send({ error: "Missing: Logs" });
    }
    const taskExecution = await AppContext.getTaskExecutions().get(req.params.taskExecutionId);
    taskExecution.dateAgentAlive = new Date();
    await AppContext.getTaskExecutions().update(req.params.taskExecutionId, taskExecution);
    await AppContext.getTaskExecutions().updateLogs(req.params.taskExecutionId, req.params.taskId, req.body.logs);
    res.status(200).send({});
  });
}

module.exports = routes;
