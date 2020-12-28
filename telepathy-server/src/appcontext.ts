import { AgentRegistration } from "./agents/agentregistration";
import { TaskQueue } from "./tasks/taskqueue";

let agentRegistration: AgentRegistration;
let taskQueue: TaskQueue;

export class AppContext {

    public static setAgentRegistration(reference: AgentRegistration): void {
        agentRegistration = reference;
    }

    public static getAgentRegistration(): AgentRegistration {
        return agentRegistration;
    }

    public static setTaskQueue(reference: TaskQueue): void {
        taskQueue = reference;
    }

    public static getTaskQueue(): TaskQueue {
        return taskQueue;
    }
}