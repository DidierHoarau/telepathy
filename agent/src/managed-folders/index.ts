import * as _ from 'lodash';
import { config } from '../config';
import { Logger } from '../utils-std-ts/logger';
import { Timeout } from '../utils-std-ts/timeout';
import { ManagedFolder } from './managed-folder';

const logger = new Logger('managed-folders');
let managedFolders: ManagedFolder[] = [];

export class ManagedFolders {
  public static async load(): Promise<void> {
    Promise.resolve().then(async () => {
      while (true) {
        const previousFolderNames: string[] = [];
        for (const folder of managedFolders) {
          previousFolderNames.push(folder.folderpath);
        }
        for (const folderName of _.difference(previousFolderNames, config.MANAGED_FOLDERS)) {
          logger.info(`Stop managing ${folderName}`);
        }
        for (const folderName of _.difference(config.MANAGED_FOLDERS, previousFolderNames)) {
          logger.info(`Start managing ${folderName}`);
        }
        const newFolders: ManagedFolder[] = [];
        for (const folder of config.MANAGED_FOLDERS) {
          newFolders.push(new ManagedFolder(folder));
        }
        for (const folder of newFolders) {
          await folder.scan().catch(error => {
            logger.debug(`Error scanning ${folder.folderpath}: ${error}`);
          });
        }
        managedFolders = newFolders;
        await Timeout.wait(config.SCAN_CYCLE_TIME);
      }
    });
  }
}
