import { config } from './config';
import { Updater } from './updater';
import { Logger } from './utils-std-ts/logger';
import { Timeout } from './utils-std-ts/timeout';

const logger = new Logger('app');

logger.info(`====== Starting Telepathy Agent ======`);

Promise.resolve().then(async () => {
  await config.reload();
  await Updater.startAutoUpdater();
  while (true) {
    await config.reload();
    await Timeout.wait(30 * 60 * 1000);
  }
});
