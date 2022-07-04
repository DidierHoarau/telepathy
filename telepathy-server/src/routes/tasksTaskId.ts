import * as path from "path";
import * as cron from "node-cron";
import { Logger } from "../utils-std-ts/logger";
import { FastifyInstance, RequestGenericInterface } from "fastify";
import { AppContext } from "../appContext";
import { Auth } from "../data/auth";
import { TaskOutputDefinition } from "../common-model/taskOutputDefinition";

const logger = new Logger(path.basename(__filename));

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  interface GetRequest extends RequestGenericInterface {
    Params: {
      taskId: string;
    };
  }
  fastify.get<GetRequest>("/", async (req, res) => {
    logger.debug(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    const task = await AppContext.getTasks().get(req.params.taskId);
    res.status(200).send(task.toJson());
  });

  interface DeleteRequest extends RequestGenericInterface {
    Params: {
      taskId: string;
    };
  }
  fastify.delete<DeleteRequest>("/", async (req, res) => {
    logger.info(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    await AppContext.getTasks().delete(req.params.taskId);
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
    logger.info(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    const task = await AppContext.getTasks().get(req.params.taskId);
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
    await AppContext.getTasks().update(req.params.taskId, task);
    AppContext.getScheduler().calculate();
    res.status(201).send(task);
  });
}

module.exports = routes;
