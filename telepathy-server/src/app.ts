import Fastify from "fastify";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";
import { SpanContext, SpanStatusCode } from "@opentelemetry/api";

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
import { StandardTracer } from "./utils-std-ts/standardTracer";
import { Span } from "@opentelemetry/sdk-trace-base";

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

  StandardTracer.initTelemetry();

  const span = StandardTracer.startSpan("init");

  const users = new Users();
  await users.load(span);
  AppContext.setUsers(users);

  const tasks = new Tasks();
  await tasks.load(span);
  AppContext.setTasks(tasks);

  const taskExecutions = new TaskExecutions();
  await taskExecutions.load(span);
  AppContext.setTaskExecutions(taskExecutions);

  const registeredAgents: Agent[] = [];
  const agentRegistration = new Agents(registeredAgents);
  AppContext.setAgents(agentRegistration);
  agentRegistration.waitRegistrations();

  const scheduler = new Scheduler();
  AppContext.setScheduler(scheduler);
  scheduler.calculate(span);

  TaskCleanup.startMaintenance();
  TaskCleanup.monitorTimeouts();

  span.end();

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

  fastify.addHook("onRequest", async (req) => {
    const tracerSpanApi = StandardTracer.startSpan(`${req.method}-${req.url}`);
    let context: Span;
    if (req.headers.otel_context) {
      const spanContextHeaders = JSON.parse(req.headers.otel_context as string);
      tracerSpanApi.spanContext().traceId = spanContextHeaders.traceId;
      tracerSpanApi.spanContext().spanId = spanContextHeaders.spanId;
      tracerSpanApi.spanContext().isRemote = true;
    }
    tracerSpanApi.spanContext();
    tracerSpanApi.setAttribute(SemanticAttributes.HTTP_METHOD, req.method);
    tracerSpanApi.setAttribute(
      SemanticAttributes.HTTP_URL,
      `${AppContext.getConfig().SERVICE_ID.toLowerCase()}-${AppContext.getConfig().VERSION}-${req.url}`
    );
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (req as any).tracerSpanApi = tracerSpanApi;
  });

  fastify.addHook("onResponse", async (req, reply, payload) => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const tracerSpanApi = (req as any).tracerSpanApi as Span;
    if (reply.statusCode > 299) {
      tracerSpanApi.status.code = SpanStatusCode.ERROR;
    } else {
      tracerSpanApi.status.code = SpanStatusCode.OK;
    }
    tracerSpanApi.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, reply.statusCode);
    tracerSpanApi.end();
  });

  fastify.addHook("onError", async (req, reply, error) => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const tracerSpanApi = (req as any).tracerSpanApi as Span;
    tracerSpanApi.status.code = SpanStatusCode.ERROR;
    tracerSpanApi.recordException(error);
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
