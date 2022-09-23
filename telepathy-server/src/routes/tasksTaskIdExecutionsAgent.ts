import { FastifyInstance, RequestGenericInterface } from "fastify";
import { Auth } from "../data/auth";
import { AppContext } from "../appContext";
import { TaskExecution } from "../common-model/taskExecution";
import { StandardTracer } from "../utils-std-ts/standardTracer";

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  interface GetAgentExecutionId extends RequestGenericInterface {
    Params: {
      taskId: string;
      taskExecutionId: string;
    };
  }
  fastify.get<GetAgentExecutionId>("/:taskExecutionId", async (req, res) => {
    Auth.mustBeAuthenticated(req, res);
    const taskExecution = await AppContext.getTaskExecutions().get(
      StandardTracer.getSpanFromRequest(req),
      req.params.taskExecutionId
    );
    taskExecution.dateAgentAlive = new Date();
    await AppContext.getTaskExecutions().update(
      StandardTracer.getSpanFromRequest(req),
      req.params.taskExecutionId,
      taskExecution
    );
    res.status(200).send(taskExecution);
  });

  interface PutAgentExecutionId extends RequestGenericInterface {
    Params: {
      taskId: string;
      taskExecutionId: string;
    };
  }
  fastify.put<PutAgentExecutionId>("/:taskExecutionId", async (req, res) => {
    Auth.mustBeAuthenticated(req, res);
    const taskExecutionUpdate = TaskExecution.fromJson(req.body);
    await AppContext.getTaskExecutions().update(
      StandardTracer.getSpanFromRequest(req),
      req.params.taskExecutionId,
      taskExecutionUpdate
    );
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
    Auth.mustBeAuthenticated(req, res);
    if (!req.body.logs) {
      return res.status(400).send({ error: "Missing: Logs" });
    }
    const taskExecution = await AppContext.getTaskExecutions().get(
      StandardTracer.getSpanFromRequest(req),
      req.params.taskExecutionId
    );
    taskExecution.dateAgentAlive = new Date();
    await AppContext.getTaskExecutions().update(
      StandardTracer.getSpanFromRequest(req),
      req.params.taskExecutionId,
      taskExecution
    );
    await AppContext.getTaskExecutions().updateLogs(
      StandardTracer.getSpanFromRequest(req),
      req.params.taskExecutionId,
      req.params.taskId,
      req.body.logs
    );
    res.status(200).send({});
  });
}

module.exports = routes;
