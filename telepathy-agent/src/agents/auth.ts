import axios from "axios";
import * as _ from "lodash";
import { config } from "../config";
import { Logger } from "../utils-std-ts/logger";
import { Timeout } from "../utils-std-ts/timeout";

const logger = new Logger("agents/auth");

let token = "";

export class Auth {
  //
  public static check(): void {
    Promise.resolve().then(async () => {
      while (true) {
        logger.debug(`Contacting server(s)`);
        await axios
          .post(`${config.SERVER}/agents/${config.AGENT_ID}/session`, {
            key: config.AGENT_KEY,
          })
          .then(async (res) => {
            token = res.data.token;
            logger.debug(
              `Authentication successful to Server: ${config.SERVER}`
            );
          })
          .catch((error) => {
            logger.error(`Error authenticating to server: ${error}`);
          });
        await Timeout.wait(config.HEARTBEAT_CYCLE * 1000);
      }
    });
  }

  public static async getAuthHeader(): Promise<any> {
    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    } else {
      return {};
    }
  }
}
