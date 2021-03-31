import { watchFile } from "fs-extra";
import { Auth } from "./process/auth";
import { config } from "./config";
import { TaskExecutions } from "./process/taskExecutions";
import { Logger } from "./utils-std-ts/logger";

const logger = new Logger("app");

logger.info(`====== Starting Telepathy Agent ======`);

Promise.resolve().then(async () => {
  watchFile(config.CONFIG_FILE, () => {
    logger.info(`Config updated: ${config.CONFIG_FILE}`);
    config.reload();
  });
  setTimeout(() => {
    Auth.check();
  }, 100);
  setTimeout(() => {
    TaskExecutions.check();
  }, 1000);
});
