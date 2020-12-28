import { config } from './config';
import { HttpTools } from './utils-std-ts/http-tools';
import { Logger } from './utils-std-ts/logger';
import { Timeout } from './utils-std-ts/timeout';

const logger = new Logger('server-link');

export class ServerLink {
  //
  public static connect(): void {
    Promise.resolve().then(async () => {
      while (true) {
        logger.debug(`Contacting server(s)`);
        await HttpTools.post({
          json: {
            agent_id: config.AGENT_ID
          },
          url: `${config.SERVER}/agents`
        }).then(() => {
          logger.debug(`Heartbeat Successful to Server: ${config.SERVER}`);
        }).catch(error => {
          logger.error(`Can not connect to server: ${error}`);
        });
        await Timeout.wait(config.SCAN_CYCLE_TIME);
      }
    });
  }
}
