import * as path from "path";
import * as cron from "node-cron";
import { Logger } from "../utils-std-ts/logger";
import { FastifyInstance, RequestGenericInterface } from "fastify";
import { AppContext } from "../appContext";
import { Auth } from "../data/auth";
import { Task } from "../common-model/task";
const opentelemetry = require("@opentelemetry/api");

const logger = new Logger(path.basename(__filename));

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  fastify.get("/", async (req, res) => {
    logger.debug(`[${req.method}] ${req.url}`);
    await Auth.mustBeAuthenticated(req, res);
    const tasks = await AppContext.getTasks().list();
    res.status(200).send({
      tasks,
    });
  });

  interface Post extends RequestGenericInterface {
    Body: {
      name: string;
      script: string;
      schedule: string;
    };
  }
  fastify.post<Post>("/", async (req, res) => {
    logger.info(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    if (!req.body.name) {
      return res.status(400).send({ error: "Missing: Name" });
    }
    if (!req.body.script) {
      return res.status(400).send({ error: "Missing: Script" });
    }
    if (req.body.schedule && !cron.validate(req.body.schedule)) {
      return res.status(400).send({ error: "Invalid: Schedule" });
    }

    const newTask = Task.fromJson(req.body);
    await AppContext.getTasks().add(newTask);
    AppContext.getScheduler().calculate();
    res.status(201).send(newTask.toJson());
  });
}

module.exports = routes;
