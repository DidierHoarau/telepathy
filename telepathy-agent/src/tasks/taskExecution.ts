import { config } from "../config";
import axios from "axios";
import { Logger } from "../utils-std-ts/logger";
import { Timeout } from "../utils-std-ts/timeout";
import * as _ from "lodash";

const logger = new Logger("serverTasks");

export class TaskExecution {
  //
  public static connect(): void {
    Promise.resolve().then(async () => {
      while (true) {
        logger.debug(`Contacting server(s)`);
        await axios
          .get(`${config.SERVER}/agents/${config.AGENT_ID}/tasks`)
          .then((res) => {
            logger.debug(`Heartbeat Successful to Server: ${config.SERVER}`);
            if (
              _.isArray(res.data.tasks.queued) &&
              res.data.tasks.queued.length > 0
            ) {
              logger.info(res.data.tasks);
            }
          })
          .catch((error) => {
            logger.error(`Can not connect to server: ${error}`);
          });
        await Timeout.wait(config.HEARTBEAT_CYCLE * 1000);
      }
    });
  }
}
