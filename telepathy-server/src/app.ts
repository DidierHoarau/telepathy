import * as bodyParser from "body-parser";
import * as express from "express";
import { NextFunction, Response, Request } from "express";
import { watchFile } from "fs-extra";
import { AppContext } from "./appContext";
import { Agent } from "./common-model/agent";
import { Config } from "./config";
import { Agents } from "./data/agents";
import { Auth } from "./data/auth";
import { Scheduler } from "./data/scheduler";
import { TaskCleanup } from "./data/taskCleanup";
import { TaskExecutions } from "./data/taskExecutions";
import { Tasks } from "./data/tasks";
import { Users } from "./data/users";
import { router } from "./router";
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
  AppContext.setUsers(users);

  const registeredAgents: Agent[] = [];
  const agentRegistration = new Agents(registeredAgents);
  AppContext.setAgents(agentRegistration);
  agentRegistration.waitRegistrations();

  const tasks = new Tasks();
  AppContext.setTasks(tasks);
  const taskExecutions = new TaskExecutions();
  AppContext.setTaskExecutions(taskExecutions);

  const scheduler = new Scheduler();
  AppContext.setScheduler(scheduler);
  setTimeout(() => {
    scheduler.calculate();
  }, 500);

  setTimeout(() => {
    TaskCleanup.start();
  }, 1000);

  const app = express();
  if (AppContext.getConfig().CORS_POLICY_ORIGIN) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.header("Access-Control-Allow-Origin", AppContext.getConfig().CORS_POLICY_ORIGIN);
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
      next();
    });
  }
  app.use(bodyParser.json());
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    req.user = { authenticated: false };
    if (req.headers.authorization) {
      try {
        req.user = await Auth.checkToken(req.headers.authorization.split(" ")[1]);
      } catch (err) {
        logger.error(err);
      }
    }
    next();
  });

  app.use(router);
  app.listen(AppContext.getConfig().API_PORT, () => {
    logger.info(`App listening on port ${AppContext.getConfig().API_PORT}`);
  });
});
