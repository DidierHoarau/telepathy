import { FastifyInstance, RequestGenericInterface } from "fastify";
import { Auth } from "../data/auth";
import { AppContext } from "../appContext";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { StandardTracer } from "../utils-std-ts/standardTracer";

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  interface GetTaskExecutionRequest extends RequestGenericInterface {
    Params: {
      taskId: string;
      taskExecutionId: string;
    };
  }
  fastify.get<GetTaskExecutionRequest>("/", async (req, res) => {
    Auth.mustBeAuthenticated(req, res);
    const taskExecution = await AppContext.getTaskExecutions().get(
      StandardTracer.getSpanFromRequest(req),
      req.params.taskExecutionId
    );
    res.status(200).send(taskExecution.toJson());
  });

  interface PostTaskExecutionCancellationRequest extends RequestGenericInterface {
    Params: {
      taskId: string;
      taskExecutionId: string;
    };
  }
  fastify.post<PostTaskExecutionCancellationRequest>("/cancellation", async (req, res) => {
    Auth.mustBeAuthenticated(req, res);
    const taskExecution = await AppContext.getTaskExecutions().get(
      StandardTracer.getSpanFromRequest(req),
      req.params.taskExecutionId
    );
    if (taskExecution.status === TaskExecutionStatus.queued) {
      taskExecution.status = TaskExecutionStatus.cancelled;
    } else if (taskExecution.status === TaskExecutionStatus.executing) {
      taskExecution.status = TaskExecutionStatus.cancelling;
    } else {
      return res.status(403).send({ error: "Wrong Status" });
    }
    await AppContext.getTaskExecutions().update(
      StandardTracer.getSpanFromRequest(req),
      req.params.taskExecutionId,
      taskExecution
    );
    res.status(202).send({});
  });

  interface GetTaskExecutionLogRequest extends RequestGenericInterface {
    Params: {
      taskId: string;
      taskExecutionId: string;
    };
  }
  fastify.get<GetTaskExecutionLogRequest>("/logs", async (req, res) => {
    Auth.mustBeAuthenticated(req, res);
    const logs = await AppContext.getTaskExecutions().getLogs(
      StandardTracer.getSpanFromRequest(req),
      req.params.taskExecutionId,
      req.params.taskId
    );
    res.status(200).send({ logs: logs.toString() });
  });
}

module.exports = routes;
