import * as cron from "node-cron";
import { FastifyInstance, RequestGenericInterface } from "fastify";
import { AppContext } from "../appContext";
import { Auth } from "../data/auth";
import { Task } from "../common-model/task";
import { StandardTracer } from "../utils-std-ts/standardTracer";

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  fastify.get("/", async (req, res) => {
    await Auth.mustBeAuthenticated(req, res);
    const tasks = await AppContext.getTasks().list(StandardTracer.getSpanFromRequest(req));
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
    await AppContext.getTasks().add(StandardTracer.getSpanFromRequest(req), newTask);
    AppContext.getScheduler().calculate(StandardTracer.getSpanFromRequest(req));
    res.status(201).send(newTask.toJson());
  });
}

module.exports = routes;
