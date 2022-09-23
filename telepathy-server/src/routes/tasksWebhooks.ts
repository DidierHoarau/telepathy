import * as _ from "lodash";
import { FastifyInstance, RequestGenericInterface } from "fastify";
import { AppContext } from "../appContext";
import { StandardTracer } from "../utils-std-ts/standardTracer";

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  interface PostTaskWebhook extends RequestGenericInterface {
    Params: {
      webhookId: string;
    };
  }
  fastify.post<PostTaskWebhook>("/:webhookId", async (req, res) => {
    const tasks = await AppContext.getTasks().list(StandardTracer.getSpanFromRequest(req));
    const task = _.find(tasks, {
      webhook: req.params.webhookId,
    });
    if (!task) {
      return res.status(404).send({ error: "Not Found" });
    }
    const newTaskExecution = await AppContext.getTaskExecutions().createFromTaskId(
      StandardTracer.getSpanFromRequest(req),
      task.id
    );
    res.status(201).send(newTaskExecution.toJson());
  });
}

module.exports = routes;
