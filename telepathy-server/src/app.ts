import { StandardMeter, StandardTracer } from "@devopsplaybook.io/otel-utils";
import { StandardTracerFastifyRegisterHooks } from "@devopsplaybook.io/otel-utils-fastify";
import fastifyCors from "@fastify/cors";
import Fastify from "fastify";
import { watchFile } from "fs-extra";
import { Agent } from "./common-model/Agent";
import { Config } from "./Config";
import { AgentsData } from "./data/AgentsData";
import { Auth } from "./data/Auth";
import { FileDBUtils } from "./data/FileDbUtils";
import { TaskExecutionsData } from "./data/TaskExecutionsData";
import { TasksData } from "./data/TasksData";
import { UsersData } from "./data/UsersData";
import { OTelLogger, OTelSetMeter, OTelSetTracer, OTelTracer } from "./OTelContext";
import { Scheduler } from "./process/Scheduler";
import { TaskCleanup } from "./process/TaskCleanup";
import { AgentIdRoutes } from "./routes/AgentIdRoutes";
import { AgentsRoutes } from "./routes/AgentsRoutes";
import { TaskIdRoutes } from "./routes/TaskIdRoutes";
import { TasksExecutionIdRoutes } from "./routes/TasksExecutionIdRoutes";
import { TasksExecutionsForAgentsRoutes } from "./routes/TasksExecutionsForAgentsRoutes";
import { TasksExecutuionsRoutes } from "./routes/TasksExecutionsRoutes";
import { TasksRoutes } from "./routes/TasksRoutes";
import { TasksWebhooksRoutes } from "./routes/TasksWebhooksRoutes";
import { UserIdRoutes } from "./routes/UserIdRoutes";
import { UserRoutes } from "./routes/UsersRoutes";

const logger = OTelLogger().createModuleLogger("app");

logger.info("====== Starting Telepathy Server ======");

Promise.resolve().then(async () => {
  //
  const config = new Config();
  await config.reload();
  watchFile(config.CONFIG_FILE, () => {
    logger.info(`Config updated: ${config.CONFIG_FILE}`);
    config.reload();
  });

  OTelSetTracer(new StandardTracer(config));
  OTelSetMeter(new StandardMeter(config));
  OTelLogger().initOTel(config);

  const span = OTelTracer().startSpan("init");

  FileDBUtils.init(config);
  Auth.init(config);

  const usersData = new UsersData();
  await usersData.load(span);

  const tasksData = new TasksData();
  await tasksData.load(span);

  const taskExecutionsData = new TaskExecutionsData(config, tasksData);
  await taskExecutionsData.load(span);

  const registeredAgents: Agent[] = [];
  const agentsData = new AgentsData(config, registeredAgents);
  agentsData.waitRegistrations();

  const scheduler = new Scheduler(tasksData, taskExecutionsData);
  scheduler.calculate(span);

  const taskCleanup = new TaskCleanup(config, tasksData, taskExecutionsData);
  taskCleanup.startMaintenance();
  taskCleanup.monitorTimeouts();

  span.end();

  // API

  const fastify = Fastify({
    logger: { level: config.LOG_LEVEL === "debug" ? "debug" : "error" },
    routerOptions: { ignoreTrailingSlash: true },
  });

  if (config.CORS_POLICY_ORIGIN) {
    fastify.register(fastifyCors, {
      origin: config.CORS_POLICY_ORIGIN,
      methods: "GET,PUT,POST,DELETE",
    });
  }

  StandardTracerFastifyRegisterHooks(fastify, OTelTracer(), OTelLogger());

  fastify.register(new AgentsRoutes(agentsData).getRoutes, { prefix: "/api/agents" });
  fastify.register(new AgentIdRoutes(config, agentsData, taskExecutionsData).getRoutes, {
    prefix: "/api/agents/:agentId",
  });
  fastify.register(new TasksRoutes(tasksData, scheduler).getRoutes, { prefix: "/api/tasks" });
  fastify.register(new TaskIdRoutes(tasksData, scheduler).getRoutes, { prefix: "/api/tasks/:taskId" });
  fastify.register(new TasksExecutuionsRoutes(taskExecutionsData).getRoutes, {
    prefix: "/api/tasks/:taskId/executions",
  });
  fastify.register(new TasksExecutionsForAgentsRoutes(taskExecutionsData).getRoutes, {
    prefix: "/api/tasks/:taskId/executions/agent",
  });
  fastify.register(new TasksExecutionIdRoutes(taskExecutionsData).getRoutes, {
    prefix: "/api/tasks/:taskId/executions/:taskExecutionId",
  });
  fastify.register(new TasksWebhooksRoutes(tasksData, taskExecutionsData).getRoutes, { prefix: "/api/tasks/webhooks" });
  fastify.register(new UserRoutes(usersData).getRoutes, { prefix: "/api/users" });
  fastify.register(new UserIdRoutes(usersData).getRoutes, { prefix: "/api/users/:userId" });

  fastify.listen({ port: config.API_PORT, host: "0.0.0.0" }, (err) => {
    if (err) {
      logger.error("API failed to start", err);
      process.exit(1);
    }
    logger.info("API Listening");
  });
});
