import * as fse from 'fs-extra';
import * as md5File from 'md5-file/promise';
import * as path from 'path';
import { Logger } from '../utils-std-ts/logger';
import { ManagedFile } from './managed-file';

const logger = new Logger('managed-folder');

export class ManagedFolder {
  //
  public files: ManagedFile[];
  public folderpath: string;

  constructor(folderpath: string) {
    this.folderpath = folderpath;
  }

  public async scan(): Promise<void> {
    const newFileList = [];
    await scanFolder(this.folderpath, newFileList);
    this.files = newFileList;
    logger.debug(`Found: ${this.files.length} files in ${this.folderpath}`);
  }
}

async function scanFolder(folderpath: string, fileList: ManagedFile[]): Promise<void> {
  logger.debug(`Scaning ${folderpath}`);
  const folderContent = await fse.readdir(folderpath);
  for (const foundFile of folderContent) {
    try {
      const foundFilePath = path.join(folderpath, foundFile);
      const foundFileInfo = await fse.lstat(foundFilePath);
      if (foundFileInfo.isDirectory()) {
        await scanFolder(foundFilePath, fileList);
      } else {
        logger.debug(`Found file ${foundFilePath}`);
        const managedFile = new ManagedFile();
        managedFile.filepath = foundFilePath;
        managedFile.mdate = foundFileInfo.mtime;
        // TODO Fix CPU issue
        // managedFile.md5 = await md5File(foundFilePath);
        fileList.push(managedFile);
      }
    } catch (err) {
      logger.error(`Error scaning file ${foundFile}${err}`);
    }
  }
}
