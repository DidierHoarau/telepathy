import * as fse from "fs-extra";
import * as os from "os";
import { Logger } from "./utils-std-ts/Logger";
import { v4 as uuidv4 } from "uuid";
import { ConfigInterface } from "./utils-std-ts/models/ConfigInterface";

const logger = new Logger("config");

export class Config implements ConfigInterface {
  //
  public readonly CONFIG_FILE: string = process.env.TELEPATHY_CONFIG || "";
  public readonly SERVICE_ID = "telepathy-agent";
  public VERSION = 1;
  public SERVER = "";
  public AGENT_ID: string = os.hostname();
  public LOG_DEBUG = false;
  public HEARTBEAT_CYCLE = 60;
  public TAGS: string[] = [];
  public AGENT_KEY: string = uuidv4();
  public TASK_ALIVE_FREQUENCY = 10;
  public OPENTELEMETRY_COLLECTOR_HTTP: string;
  public OPENTELEMETRY_COLLECTOR_AWS = false;

  public async reload(): Promise<void> {
    const content = await fse.readJson(this.CONFIG_FILE);
    const setIfSet = (field: string, displayLog = true) => {
      if (content[field]) {
        this[field] = content[field];
      }
      if (displayLog) {
        logger.info(`Configuration Value: ${field}: ${this[field]}`);
      } else {
        logger.info(`Configuration Value: ${field}: ********************`);
      }
    };
    logger.info(`Configuration Value: CONFIG_FILE: ${this.CONFIG_FILE}`);
    logger.info(`Configuration Value: VERSION: ${this.VERSION}`);
    setIfSet("SERVER");
    setIfSet("AGENT_ID");
    setIfSet("TAGS");
    setIfSet("HEARTBEAT_CYCLE");
    setIfSet("LOG_DEBUG");
    setIfSet("AGENT_KEY", false);
    setIfSet("TASK_ALIVE_FREQUENCY");
    setIfSet("OPENTELEMETRY_COLLECTOR_HTTP");
    setIfSet("OPENTELEMETRY_COLLECTOR_AWS");
  }
}

export const config = new Config();
