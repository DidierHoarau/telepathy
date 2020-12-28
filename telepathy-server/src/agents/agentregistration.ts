import * as _ from 'lodash';
import { config } from '../config';
import { Logger } from '../utils-std-ts/logger';
import { Timeout } from '../utils-std-ts/timeout';
import { Agent } from './agent';

const logger = new Logger('agents/agentregistration');

export class AgentRegistration {
  //
  registeredAgents: Agent[];

  constructor(agentList: Agent[]) {
    this.registeredAgents = agentList;
  }

  public async register(newAgent: Agent): Promise<void> {
    const knownAgent = _.find(this.registeredAgents, { agentId: newAgent.agentId });
    if (knownAgent) {
      knownAgent.lastSyncDate = new Date();
    } else { 
      logger.info(`New agent registered: ${newAgent.agentId}`);
      newAgent.lastSyncDate = new Date();
      this.registeredAgents.push(newAgent);
    }
  }

  public waitRegistrations(): void {
    Promise.resolve().then(async () => {
      while (true) {
        for (let i = this.registeredAgents.length - 1; i >= 0; i--) {
          if (
            this.registeredAgents[i].lastSyncDate.getTime() <
            new Date().getTime() - config.AGENT_REGISTRATION_DURATION
          ) {
            logger.info(`Agent un-registered: ${this.registeredAgents[i].agentId}`);
            this.registeredAgents.splice(i, 1);
          }
        }
        await Timeout.wait(config.AGENT_REGISTRATION_DURATION / 2);
      }
    });
  }
}
