import { watchFile } from "fs-extra";
import { Auth } from "./process/Auth";
import { Config } from "./Config";
import { TaskExecutions } from "./process/TaskExecutions";
import { Logger } from "./utils-std-ts/Logger";
import { StandardTracer } from "./utils-std-ts/StandardTracer";

const logger = new Logger("app");

logger.info(`====== Starting Telepathy Agent ======`);

Promise.resolve().then(async () => {
  //
  const config = new Config();
  await config.reload();
  watchFile(config.CONFIG_FILE, () => {
    logger.info(`Config updated: ${config.CONFIG_FILE}`);
    config.reload();
  });

  StandardTracer.initTelemetry(config);

  Auth.init(config);
  TaskExecutions.init(config);

  setTimeout(() => {
    Auth.check();
  }, 100);
  setTimeout(() => {
    TaskExecutions.check();
  }, 1000);
});
