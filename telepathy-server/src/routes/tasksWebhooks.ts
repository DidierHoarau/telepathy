import * as _ from "lodash";
import * as path from "path";
import { Logger } from "../utils-std-ts/logger";
import { FastifyInstance, RequestGenericInterface } from "fastify";
import { AppContext } from "../appContext";

const logger = new Logger(path.basename(__filename));

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  interface PostTaskWebhook extends RequestGenericInterface {
    Params: {
      webhookId: string;
    };
  }
  fastify.post<PostTaskWebhook>("/:webhookId", async (req, res) => {
    logger.info(`[${req.method}] ${req.url}`);
    const tasks = await AppContext.getTasks().list();
    const task = _.find(tasks, {
      webhook: req.params.webhookId,
    });
    if (!task) {
      return res.status(404).send({ error: "Not Found" });
    }
    const newTaskExecution = await AppContext.getTaskExecutions().createFromTaskId(task.id);
    res.status(201).send(newTaskExecution.toJson());
  });
}

module.exports = routes;
