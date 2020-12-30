import { config } from "../config";
import axios from "axios";
import { Logger } from "../utils-std-ts/logger";
import { Timeout } from "../utils-std-ts/timeout";
import * as _ from "lodash";
import { TaskExecution } from "./taskExecution";

const logger = new Logger("serverTasks");

export class TaskExecutions {
  //
  public static check(): void {
    Promise.resolve().then(async () => {
      while (true) {
        logger.debug(`Contacting server(s)`);
        await axios
          .get(`${config.SERVER}/agents/${config.AGENT_ID}/tasks/executions`)
          .then((res) => {
            logger.debug(`Heartbeat Successful to Server: ${config.SERVER}`);
            if (
              _.isArray(res.data.task_executions) &&
              res.data.task_executions.length > 0
            ) {
              for (const taskExecution of res.data
                .task_executions as TaskExecution[]) {
                logger.info(taskExecution);
              }
            }
          })
          .catch((error) => {
            logger.error(`Can not connect to server: ${error}`);
          });
        await Timeout.wait(config.HEARTBEAT_CYCLE * 1000);
      }
    });
  }

  private async processQueued(taskExecution: TaskExecution): Promise<void> {}
}
