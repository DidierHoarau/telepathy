import * as fse from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "./utils-std-ts/logger";

const logger = new Logger("config");

class Config {
  //
  public readonly CONFIG_FILE: string = process.env.TELEPATHY_CONFIG;
  public readonly API_PORT: number = 8080;
  public VERSION: number = 1;
  public AGENT_REGISTRATION_DURATION: number = 30 * 60;
  public JWT_VALIDITY_DURATION: number = 7 * 24 * 3600;
  public CORS_POLICY_ORIGIN: string;
  public DATA_DIR: string = ".";
  public AGENT_KEY: string = uuidv4();

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
    setIfSet("JWT_VALIDITY_DURATION");
    setIfSet("CORS_POLICY_ORIGIN");
    setIfSet("DATA_DIR");
    setIfSet("AGENT_KEY");
  }
}

export const config = new Config();
