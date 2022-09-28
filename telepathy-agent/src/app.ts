import { watchFile } from "fs-extra";
import { Auth } from "./process/auth";
import { Config } from "./config";
import { TaskExecutions } from "./process/taskExecutions";
import { Logger } from "./utils-std-ts/logger";
import { StandardTracer } from "./utils-std-ts/standardTracer";
import { AppContext } from "./appContext";

const logger = new Logger("app");

logger.info(`====== Starting Telepathy Agent ======`);

Promise.resolve().then(async () => {
  //
  const config = new Config();
  await config.reload();
  AppContext.setConfig(config);
  watchFile(AppContext.getConfig().CONFIG_FILE, () => {
    logger.info(`Config updated: ${AppContext.getConfig().CONFIG_FILE}`);
    AppContext.getConfig().reload();
  });

  StandardTracer.initTelemetry(config);

  setTimeout(() => {
    Auth.check();
  }, 100);
  setTimeout(() => {
    TaskExecutions.check();
  }, 1000);
});
