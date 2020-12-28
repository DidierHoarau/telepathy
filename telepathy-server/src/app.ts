import * as express from "express";
import { watchFile } from "fs-extra";
import { Agent } from "./agents/agent";
import { AgentRegistration } from "./agents/agentRegistration";
import { AppContext } from "./appContext";
import { config } from "./config";
import { router } from "./router";
import { Task } from "./tasks/task";
import { Logger } from "./utils-std-ts/logger";

const logger = new Logger("app");

logger.info(`====== Starting Telepathy Server ======`);

Promise.resolve().then(async () => {
  watchFile(config.CONFIG_FILE, () => {
    logger.info(`Config updated: ${config.CONFIG_FILE}`);
    config.reload();
  });

  setTimeout(() => {
    const registeredAgents: Agent[] = [];
    const agentRegistration = new AgentRegistration(registeredAgents);
    AppContext.setAgentRegistration(agentRegistration);
    agentRegistration.waitRegistrations();

    const tasks: Task[] = [];
    AppContext.setTasks(tasks);

    const app = express();
    app.use(router);
    app.listen(config.API_PORT, () => {
      logger.info(`App listening on port ${config.API_PORT}`);
    });
  }, 100);
});
