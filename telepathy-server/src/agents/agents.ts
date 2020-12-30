import * as _ from "lodash";
import { config } from "../config";
import { Logger } from "../utils-std-ts/logger";
import { Timeout } from "../utils-std-ts/timeout";
import { Agent } from "./agent";

const logger = new Logger("agents/agentregistration");

export class Agents {
  //
  agents: Agent[];

  constructor(agentList: Agent[]) {
    this.agents = agentList;
  }

  async list(): Promise<Agent[]> {
    return this.agents;
  }

  public async register(newAgent: Agent): Promise<void> {
    const knownAgent: Agent = _.find(this.agents, {
      id: newAgent.id,
    }) as Agent;
    if (knownAgent) {
      knownAgent.lastSyncDate = new Date();
    } else {
      logger.info(`New agent registered: ${newAgent.id}`);
      newAgent.lastSyncDate = new Date();
      this.agents.push(newAgent);
    }
  }

  public waitRegistrations(): void {
    Promise.resolve().then(async () => {
      while (true) {
        for (let i = this.agents.length - 1; i >= 0; i--) {
          if (
            this.agents[i].lastSyncDate.getTime() <
            new Date().getTime() - config.AGENT_REGISTRATION_DURATION
          ) {
            logger.info(`Agent un-registered: ${this.agents[i].id}`);
            this.agents.splice(i, 1);
          }
        }
        await Timeout.wait((1000 * config.AGENT_REGISTRATION_DURATION) / 2);
      }
    });
  }
}
