import { FastifyInstance, RequestGenericInterface } from "fastify";
import { Auth } from "../data/Auth";
import { TaskExecution } from "../common-model/TaskExecution";
import { TaskExecutionsData } from "../data/TaskExecutionsData";
import { StandardTracerGetSpanFromRequest } from "../utils-std-ts/StandardTracer";

let taskExecutionsData: TaskExecutionsData;

export class TasksExecutionsForAgentsRoutes {
  //
  constructor(taskExecutionsDataIn: TaskExecutionsData) {
    taskExecutionsData = taskExecutionsDataIn;
  }

  public async getRoutes(fastify: FastifyInstance): Promise<void> {
    //
    interface GetAgentExecutionId extends RequestGenericInterface {
      Params: {
        taskId: string;
        taskExecutionId: string;
      };
    }
    fastify.get<GetAgentExecutionId>("/:taskExecutionId", async (req, res) => {
      Auth.mustBeAuthenticated(req, res);
      const taskExecution = await taskExecutionsData.get(
        StandardTracerGetSpanFromRequest(req),
        req.params.taskExecutionId
      );
      taskExecution.dateAgentAlive = new Date();
      await taskExecutionsData.update(StandardTracerGetSpanFromRequest(req), req.params.taskExecutionId, taskExecution);
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
      await taskExecutionsData.update(
        StandardTracerGetSpanFromRequest(req),
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
      const taskExecution = await taskExecutionsData.get(
        StandardTracerGetSpanFromRequest(req),
        req.params.taskExecutionId
      );
      taskExecution.dateAgentAlive = new Date();
      await taskExecutionsData.update(StandardTracerGetSpanFromRequest(req), req.params.taskExecutionId, taskExecution);
      await taskExecutionsData.updateLogs(
        StandardTracerGetSpanFromRequest(req),
        req.params.taskExecutionId,
        req.params.taskId,
        req.body.logs
      );
      res.status(200).send({});
    });
  }
}
