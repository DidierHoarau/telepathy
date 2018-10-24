import * as _ from 'lodash';
import { config } from '../config';
import { Logger } from '../utils-std-ts/logger';
import { Timeout } from '../utils-std-ts/timeout';
import { Agent } from './agent';

const logger = new Logger('agents/registered-agents');

const registeredAgents: Agent[] = [];

export class RegisteredAgents {
  //
  public static async register(newAgent: Agent): Promise<void> {
    const knownAgent = _.find(registeredAgents, { agentId: newAgent.agentId });
    if (knownAgent) {
      knownAgent.lastSyncDate = new Date();
    } else {
      logger.info(`New agent registered: ${newAgent.agentId}`);
      newAgent.lastSyncDate = new Date();
      registeredAgents.push(newAgent);
    }
  }

  public static init(): void {
    Promise.resolve().then(async () => {
      while (true) {
        for (let i = registeredAgents.length - 1; i >= 0; i--) {
          if (
            registeredAgents[i].lastSyncDate.getTime() <
            new Date().getTime() - config.AGENT_REGISTRATION_DURATION
          ) {
            logger.info(`Agent un-registered: ${registeredAgents[i].agentId}`);
            registeredAgents.splice(i, 1);
          }
        }
        await Timeout.wait(config.AGENT_REGISTRATION_DURATION / 2);
      }
    });
  }
}
