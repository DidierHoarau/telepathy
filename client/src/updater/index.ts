import * as fse from 'fs-extra';
import { Logger } from '../utils-std-ts/logger';

const logger = new Logger('updater');

export class Updater {
  //
  public static checkUpdate(): Promise<boolean> {
    logger.debug('Checking update');
    return Promise.resolve(true);
  }
}
