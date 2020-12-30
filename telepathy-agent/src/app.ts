import { watchFile } from "fs-extra";
import { config } from "./config";
import { ServerTasks } from "./tasks/serverTasks";
import { TaskExecutions } from "./tasks/taskExecutions";
import { Logger } from "./utils-std-ts/logger";

const logger = new Logger("app");

logger.info(`====== Starting Telepathy Agent ======`);

Promise.resolve().then(async () => {
  watchFile(config.CONFIG_FILE, () => {
    logger.info(`Config updated: ${config.CONFIG_FILE}`);
    config.reload();
  });
  setTimeout(() => {
    TaskExecutions.check();
  }, 100);
});
