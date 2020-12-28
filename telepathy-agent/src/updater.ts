import * as childProcess from 'child_process';
import { config } from './config';
import { HttpTools } from './utils-std-ts/http-tools';
import { Logger } from './utils-std-ts/logger';
import { Timeout } from './utils-std-ts/timeout';

const logger = new Logger('updater');

export class Updater {
  //
  public static startAutoUpdater(): void {
    Promise.resolve().then(async () => {
      while (true) {
        if (config.UPDATE_AUTO) {
          Updater.checkUpdate().catch(error => {
            logger.error(`Autoupdate failed: ${error}`);
          });
        }
        await Timeout.wait(1000 * 3600 * 24);
      }
    });
  }

  private static async checkUpdate(): Promise<void> {
    logger.debug('Checking update');
    const data = await HttpTools.get({ url: config.UPDATE_URL_INFO, json: false });
    const builds = data.split('\n');
    for (const build of builds) {
      const buildInfo = build.split(':');
      if (
        buildInfo.length === 2 &&
        buildInfo[0] === config.ARCH &&
        buildInfo[1] !== config.VERSION
      ) {
        logger.info(`Update available: ${config.VERSION} -> ${buildInfo[1]}`);
        childProcess.spawn('/opt/telepathy/telepathy-agent-installer.sh', {
          detached: true
        } as any);
      }
    }
  }
}
