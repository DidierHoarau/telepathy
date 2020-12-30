import * as fse from 'fs-extra';
import * as os from 'os';
import { Logger } from './utils-std-ts/logger';

const logger = new Logger('config');

class Config {
  //
  public readonly CONFIG_FILE: string = process.env.TELEPATHY_CONFIG;
  public VERSION: number = 1;
  public SERVER: string = '';
  public AGENT_ID: string = os.hostname();
  public LOG_DEBUG: boolean = false;
  public HEARTBEAT_CYCLE: number = 60;

  public constructor() {
    this.reload();
  }

  public async reload(): Promise<void> {
    const content = await fse.readJson(this.CONFIG_FILE);
    const setIfSet = (field) => {
      if (content[field]) {
        this[field] = content[field];
      }
      logger.info(`Configuration Value: ${field}: ${this[field]}`);
    };
    logger.info(`Configuration Value: CONFIG_FILE: ${this.CONFIG_FILE}`);
    logger.info(`Configuration Value: VERSION: ${this.VERSION}`);
    setIfSet('SERVER');
    setIfSet('AGENT_ID');
    setIfSet('HEARTBEAT_CYCLE');
    setIfSet('LOG_DEBUG');
  }
}

export const config = new Config();
