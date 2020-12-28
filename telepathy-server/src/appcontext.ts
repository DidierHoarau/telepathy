import { AgentRegistration } from "./agents/agentregistration";

let agentRegistration: AgentRegistration;

export class AppContext {

    public static setAgentRegistration(reference: AgentRegistration): void {
        agentRegistration = reference;
    }

    public static getAgentRegistration(): AgentRegistration {
        return agentRegistration;
    }
}