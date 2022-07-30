import Fastify from "fastify";

import { watchFile } from "fs-extra";
import { AppContext } from "./appContext";
import { Agent } from "./common-model/agent";
import { Config } from "./config";
import { Agents } from "./data/agents";
import { Scheduler } from "./data/scheduler";
import { TaskCleanup } from "./data/taskCleanup";
import { TaskExecutions } from "./data/taskExecutions";
import { Tasks } from "./data/tasks";
import { Users } from "./data/users";
import { Logger } from "./utils-std-ts/logger";

const logger = new Logger("app");

logger.info("====== Starting Telepathy Server ======");

Promise.resolve().then(async () => {
  //
  const config = new Config();
  await config.reload();
  AppContext.setConfig(config);
  watchFile(AppContext.getConfig().CONFIG_FILE, () => {
    logger.info(`Config updated: ${AppContext.getConfig().CONFIG_FILE}`);
    AppContext.getConfig().reload();
  });

  const users = new Users();
  await users.load();
  AppContext.setUsers(users);

  const tasks = new Tasks();
  await tasks.load();
  AppContext.setTasks(tasks);

  const taskExecutions = new TaskExecutions();
  await taskExecutions.load();
  AppContext.setTaskExecutions(taskExecutions);

  const registeredAgents: Agent[] = [];
  const agentRegistration = new Agents(registeredAgents);
  AppContext.setAgents(agentRegistration);
  agentRegistration.waitRegistrations();

  const scheduler = new Scheduler();
  AppContext.setScheduler(scheduler);
  scheduler.calculate();

  TaskCleanup.startMaintenance();
  TaskCleanup.monitorTimeouts();

  // API
  /* eslint-disable @typescript-eslint/no-var-requires */

  const fastify = Fastify({
    logger: AppContext.getConfig().LOG_LEVEL === "debug_tmp",
    ignoreTrailingSlash: true,
  });

  if (AppContext.getConfig().CORS_POLICY_ORIGIN) {
    fastify.register(require("@fastify/cors"), {
      origin: AppContext.getConfig().CORS_POLICY_ORIGIN,
      methods: "GET,PUT,POST,DELETE",
    });
  }

  fastify.addHook("onRequest", (req, reply, done) => {
    const tracer = opentelemetry.trace.getTracer("my-service-tracer");
    /* eslint-disable @typescript-eslint/no-explicit-any */
    // const span = tracer.startSpan(`[${req.method}] ${req.url}`);
    done();
  });

  fastify.addHook("onResponse", (req, reply, done) => {
    // (req as any).span.end();
    done();
  });

  fastify.register(require("./routes/agents"), { prefix: "/agents" });
  fastify.register(require("./routes/agentsAgentId"), { prefix: "/agents/:agentId" });
  fastify.register(require("./routes/tasks"), { prefix: "/tasks" });
  fastify.register(require("./routes/tasksTaskId"), { prefix: "/tasks/:taskId" });
  fastify.register(require("./routes/tasksTaskIdExecutions"), { prefix: "/tasks/:taskId/executions" });
  fastify.register(require("./routes/tasksTaskIdExecutionsAgent"), { prefix: "/tasks/:taskId/executions/agent" });
  fastify.register(require("./routes/tasksTaskIdExecutionsExecutionId"), {
    prefix: "/tasks/:taskId/executions/:taskExecutionId",
  });
  fastify.register(require("./routes/tasksWebhooks"), { prefix: "/tasks/webhooks" });
  fastify.register(require("./routes/users"), { prefix: "/users" });
  fastify.register(require("./routes/usersUserId"), { prefix: "/users/:userId" });

  fastify.listen({ port: AppContext.getConfig().API_PORT, host: "0.0.0.0" }, (err) => {
    if (err) {
      logger.error(err);
      fastify.log.error(err);
      process.exit(1);
    }
    logger.info("API Listerning");
  });
});
