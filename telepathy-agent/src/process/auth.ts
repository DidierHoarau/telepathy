import axios from "axios";
import { config } from "../config";
import { Logger } from "../utils-std-ts/logger";
import { Timeout } from "../utils-std-ts/timeout";

const logger = new Logger("agents/auth");

let token = "";

export class Auth {
  //
  public static async check(): Promise<void> {
    logger.debug("Contacting server");
    await axios
      .post(`${config.SERVER}/agents/${config.AGENT_ID}/session`, {
        key: config.AGENT_KEY,
        tags: config.TAGS,
      })
      .then(async (res) => {
        token = res.data.token;
        logger.debug(`Authentication successful to Server: ${config.SERVER}`);
      })
      .catch((error) => {
        logger.error(`Error authenticating to server: ${error}`);
      });
    await Timeout.wait(config.HEARTBEAT_CYCLE * 1000);
    Auth.check();
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
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
