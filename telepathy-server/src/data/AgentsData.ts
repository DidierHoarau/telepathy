import { Span } from "@opentelemetry/sdk-trace-base";
import * as _ from "lodash";
import { Agent } from "../common-model/Agent";
import { Logger } from "../utils-std-ts/Logger";
import { Config } from "../Config";
import { StandardTracerStartSpan } from "../utils-std-ts/StandardTracer";
import { TimeoutWait } from "../utils-std-ts/Timeout";

const logger = new Logger("data/agentregistration");

export class AgentsData {
  //
  private agents: Agent[];
  private config: Config;

  constructor(config: Config, agentList: Agent[]) {
    this.agents = agentList;
    this.config = config;
  }

  public async get(context: Span, id): Promise<Agent> {
    return _.find(this.agents, {
      id,
    }) as Agent;
  }

  public async list(context: Span): Promise<Agent[]> {
    return _.cloneDeep(this.agents);
  }

  public async register(context: Span, newAgent: Agent): Promise<void> {
    const span = StandardTracerStartSpan("Agents_register", context);
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
    span.end();
  }

  public async waitRegistrations(): Promise<void> {
    for (let i = this.agents.length - 1; i >= 0; i--) {
      if (
        this.agents[i].lastSyncDate.getTime() <
        new Date().getTime() - this.config.AGENT_REGISTRATION_DURATION * 1000
      ) {
        logger.info(`Agent un-registered: ${this.agents[i].id}`);
        this.agents.splice(i, 1);
      }
    }
    await TimeoutWait((1000 * this.config.AGENT_REGISTRATION_DURATION) / 2);
    this.waitRegistrations();
  }
}
