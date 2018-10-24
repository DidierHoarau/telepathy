import * as express from 'express';
import { watchFile } from 'fs-extra';
import { RegisteredAgents } from './agents/registered-agents';
import { config } from './config';
import { router } from './router';
import { Updater } from './updater';
import { Logger } from './utils-std-ts/logger';

const logger = new Logger('app');

logger.info(`====== Starting Telepathy Server ======`);

Promise.resolve().then(async () => {
  await config.reload();

  Updater.startAutoUpdater();
  RegisteredAgents.init();

  watchFile(config.CONFIG_FILE, () => {
    logger.info(`Config updated: ${config.CONFIG_FILE}`);
    config.reload();
  });

  const app = express();
  app.use(router);
  app.listen(config.API_PORT, () => {
    logger.info(`App listening on port ${config.API_PORT}`);
  });
});
