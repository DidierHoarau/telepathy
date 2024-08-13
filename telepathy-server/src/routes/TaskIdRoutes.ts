import * as cron from "node-cron";
import { FastifyInstance, RequestGenericInterface } from "fastify";
import { Auth } from "../data/Auth";
import { TaskOutputDefinition } from "../common-model/TaskOutputDefinition";
import { TasksData } from "../data/TasksData";
import { Scheduler } from "../process/Scheduler";
import { StandardTracerGetSpanFromRequest } from "../utils-std-ts/StandardTracer";

let taskData: TasksData;
let scheduler: Scheduler;

export class TaskIdRoutes {
  //
  constructor(taskDataIn: TasksData, schedulerIn: Scheduler) {
    taskData = taskDataIn;
    scheduler = schedulerIn;
  }

  public async getRoutes(fastify: FastifyInstance): Promise<void> {
    //
    interface GetRequest extends RequestGenericInterface {
      Params: {
        taskId: string;
      };
    }
    fastify.get<GetRequest>("/", async (req, res) => {
      Auth.mustBeAuthenticated(req, res);
      const task = await taskData.get(StandardTracerGetSpanFromRequest(req), req.params.taskId);
      res.status(200).send(task.toJson());
    });

    interface DeleteRequest extends RequestGenericInterface {
      Params: {
        taskId: string;
      };
    }
    fastify.delete<DeleteRequest>("/", async (req, res) => {
      Auth.mustBeAuthenticated(req, res);
      await taskData.delete(StandardTracerGetSpanFromRequest(req), req.params.taskId);
      res.status(202).send({});
    });

    interface PutRequest extends RequestGenericInterface {
      Params: {
        taskId: string;
      };
      Body: {
        name: string;
        script: string;
        schedule: string;
        webhook: string;
        tag: string;
        outputDefinitions: TaskOutputDefinition[];
      };
    }
    fastify.put<PutRequest>("/", async (req, res) => {
      Auth.mustBeAuthenticated(req, res);
      const task = await taskData.get(StandardTracerGetSpanFromRequest(req), req.params.taskId);
      if (!task) {
        return res.status(404).send({ error: "Not Found" });
      }
      if (!req.body.name) {
        return res.status(400).send({ error: "Missing: Name" });
      }
      if (!req.body.script) {
        return res.status(400).send({ error: "Missing: Script" });
      }
      if (req.body.schedule && !cron.validate(req.body.schedule)) {
        return res.status(400).send({ error: "Invalid: Schedule" });
      }
      task.name = req.body.name;
      task.script = req.body.script;
      task.schedule = req.body.schedule;
      task.webhook = req.body.webhook;
      task.tag = req.body.tag;
      task.outputDefinitions = req.body.outputDefinitions;
      await taskData.update(StandardTracerGetSpanFromRequest(req), req.params.taskId, task);
      scheduler.calculate(StandardTracerGetSpanFromRequest(req));
      res.status(201).send(task);
    });
  }
}
