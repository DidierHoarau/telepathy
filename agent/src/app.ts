import { watchFile } from 'fs-extra';
import { config } from './config';
import { ManagedFolders } from './managed-folders';
import { ServerLink } from './server-link';
import { Updater } from './updater';
import { Logger } from './utils-std-ts/logger';

const logger = new Logger('app');

logger.info(`====== Starting Telepathy Agent ======`);

Promise.resolve().then(async () => {
  await config.reload();
  watchFile(config.CONFIG_FILE, () => {
    logger.info(`Config updated: ${config.CONFIG_FILE}`);
    config.reload();
  });
  Updater.startAutoUpdater();
  await ManagedFolders.load();
  ServerLink.connect();
});
