import * as express from "express";
import * as bodyParser from "body-parser";
import { watchFile } from "fs-extra";
import { Agent } from "./agents/agent";
import { Agents } from "./agents/agents";
import { AppContext } from "./appContext";
import { config } from "./config";
import { router } from "./router";
import { Task } from "./tasks/task";
import { Logger } from "./utils-std-ts/logger";
import { Tasks } from "./tasks/tasks";
import { TaskExecutions } from "./tasks/taskExecutions";

const logger = new Logger("app");

logger.info(`====== Starting Telepathy Server ======`);

Promise.resolve().then(async () => {
  watchFile(config.CONFIG_FILE, () => {
    logger.info(`Config updated: ${config.CONFIG_FILE}`);
    config.reload();
  });

  setTimeout(() => {
    //
    const registeredAgents: Agent[] = [];
    const agentRegistration = new Agents(registeredAgents);
    AppContext.setAgents(agentRegistration);
    agentRegistration.waitRegistrations();

    const tasks = new Tasks();
    AppContext.setTasks(tasks);
    const taskExecutions = new TaskExecutions();
    AppContext.setTaskExecutions(taskExecutions);

    const app = express();
    if (config.CORS_POLICY_ORIGIN) {
      app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", config.CORS_POLICY_ORIGIN);
        res.header(
          "Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );
        res.header(
          "Access-Control-Allow-Methods",
          "POST, GET, OPTIONS, PUT, DELETE"
        );
        next();
      });
    }
    app.use(bodyParser.json());
    app.use(router);
    app.listen(config.API_PORT, () => {
      logger.info(`App listening on port ${config.API_PORT}`);
    });
  }, 100);
});
