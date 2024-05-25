import * as _ from "lodash";
import { FastifyInstance, RequestGenericInterface } from "fastify";
import { TaskExecutionsData } from "../data/TaskExecutionsData";
import { TasksData } from "../data/TasksData";
import { StandardTracerGetSpanFromRequest } from "../utils-std-ts/StandardTracer";

let taskExecutionsData: TaskExecutionsData;
let tasksData: TasksData;

export class TasksWebhooksRoutes {
  //
  constructor(taskDataIn: TasksData, taskExecutionsDataIn: TaskExecutionsData) {
    taskExecutionsData = taskExecutionsDataIn;
    tasksData = taskDataIn;
  }

  public async getRoutes(fastify: FastifyInstance): Promise<void> {
    //
    interface PostTaskWebhook extends RequestGenericInterface {
      Params: {
        webhookId: string;
      };
    }
    fastify.post<PostTaskWebhook>("/:webhookId", async (req, res) => {
      const tasks = await tasksData.list(StandardTracerGetSpanFromRequest(req));
      const task = _.find(tasks, {
        webhook: req.params.webhookId,
      });
      if (!task) {
        return res.status(404).send({ error: "Not Found" });
      }
      const newTaskExecution = await taskExecutionsData.createFromTaskId(
        StandardTracerGetSpanFromRequest(req),
        task.id
      );
      res.status(201).send(newTaskExecution.toJson());
    });
  }
}
