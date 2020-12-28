import { AgentRegistration } from "./agents/agentRegistration";
import { Task } from "./tasks/task";

let agentRegistration: AgentRegistration;
let tasks: Task[];

export class AppContext {
  //
  public static setAgentRegistration(reference: AgentRegistration): void {
    agentRegistration = reference;
  }
  public static getAgentRegistration(): AgentRegistration {
    return agentRegistration;
  }

  public static setTasks(reference: Task[]): void {
    tasks = reference;
  }
  public static getTasks(): Task[] {
    return tasks;
  }
}
