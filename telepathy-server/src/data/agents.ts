import * as _ from "lodash";
import { Agent } from "../common-model/agent";
import { config } from "../config";
import { Logger } from "../utils-std-ts/logger";
import { Timeout } from "../utils-std-ts/timeout";

const logger = new Logger("data/agentregistration");

export class Agents {
  //
  private agents: Agent[];

  constructor(agentList: Agent[]) {
    this.agents = agentList;
  }

  public async get(id): Promise<Agent> {
    return _.find(this.agents, {
      id,
    }) as Agent;
  }

  public async list(): Promise<Agent[]> {
    return _.cloneDeep(this.agents);
  }

  public async register(newAgent: Agent): Promise<void> {
    const knownAgent: Agent = _.find(this.agents, {
      id: newAgent.id,
    }) as Agent;
    if (knownAgent) {
      knownAgent.lastSyncDate = new Date();
      knownAgent.tags = newAgent.tags;
    } else {
      logger.info(`New agent registered: ${newAgent.id} (tags: ${newAgent.tags})`);
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
            new Date().getTime() - config.AGENT_REGISTRATION_DURATION * 1000
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
