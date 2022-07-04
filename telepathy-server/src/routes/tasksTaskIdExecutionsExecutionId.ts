import * as _ from "lodash";
import * as path from "path";
import { Logger } from "../utils-std-ts/logger";
import { FastifyInstance, FastifyRequest, RequestGenericInterface } from "fastify";
import { Auth } from "../data/auth";
import { AppContext } from "../appContext";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";

const logger = new Logger(path.basename(__filename));

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  interface GetTaskExecutionRequest extends RequestGenericInterface {
    Params: {
      taskId: string;
      taskExecutionId: string;
    };
  }
  fastify.get<GetTaskExecutionRequest>("/", async (req, res) => {
    logger.debug(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    const taskExecution = await AppContext.getTaskExecutions().get(req.params.taskExecutionId);
    res.status(200).send(taskExecution.toJson());
  });

  interface PostTaskExecutionCancellationRequest extends RequestGenericInterface {
    Params: {
      taskId: string;
      taskExecutionId: string;
    };
  }
  fastify.post<PostTaskExecutionCancellationRequest>("/cancellation", async (req, res) => {
    logger.info(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    const taskExecution = await AppContext.getTaskExecutions().get(req.params.taskExecutionId);
    if (taskExecution.status === TaskExecutionStatus.queued) {
      taskExecution.status = TaskExecutionStatus.cancelled;
    } else if (taskExecution.status === TaskExecutionStatus.executing) {
      taskExecution.status = TaskExecutionStatus.cancelling;
    } else {
      return res.status(403).send({ error: "Wrong Status" });
    }
    await AppContext.getTaskExecutions().update(req.params.taskExecutionId, taskExecution);
    res.status(202).send({});
  });

  interface GetTaskExecutionLogRequest extends RequestGenericInterface {
    Params: {
      taskId: string;
      taskExecutionId: string;
    };
  }
  fastify.get<GetTaskExecutionLogRequest>("/logs", async (req, res) => {
    logger.debug(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    const logs = await AppContext.getTaskExecutions().getLogs(req.params.taskExecutionId, req.params.taskId);
    res.status(200).send({ logs: logs.toString() });
  });
}

module.exports = routes;
