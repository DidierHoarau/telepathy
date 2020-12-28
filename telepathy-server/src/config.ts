import * as fse from "fs-extra";
import { Logger } from "./utils-std-ts/logger";

const logger = new Logger("config");

class Config {
  //
  public readonly CONFIG_FILE: string = process.env.TELEPATHY_CONFIG;
  public readonly API_PORT: number = 8080;
  public VERSION: number = 1;
  public AGENT_REGISTRATION_DURATION: number = 30 * 60;

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
    setIfSet("AGENT_REGISTRATION_DURATION");
  }
}

export const config = new Config();
