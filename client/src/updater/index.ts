import * as childProcess from 'child_process';
import { config } from '../config';
import { HttpTools } from '../utils-std-ts/http-tools';
import { Logger } from '../utils-std-ts/logger';
const logger = new Logger('updater');

export class Updater {
  //
  public static async checkUpdate(): Promise<void> {
    if (!config.UPDATE_AUTO) {
      return;
    }
    logger.debug('Checking update');
    const data = await HttpTools.get({ url: config.UPDATE_URL_INFO, json: false });
    const builds = data.split('\n');
    for (const build of builds) {
      const buildInfo = build.split(':');
      if (
        buildInfo.length === 2 &&
        buildInfo[0] === config.CLIENT_ARCH &&
        buildInfo[1] !== config.CLIENT_VERSION
      ) {
        logger.info(`Update available: ${config.CLIENT_VERSION} -> ${buildInfo[1]}`);
        childProcess.spawn('/opt/telepathy/telepathy-client-installer.sh', {
          detached: true
        } as any);
      }
    }
  }
}
