import { AgentRegistration } from "./agents/agentRegistration";
import { Task } from "./tasks/task";
import { TaskExecutions } from "./tasks/taskExecutions";
import { Tasks } from "./tasks/tasks";

let agentRegistration: AgentRegistration;
let tasks: Tasks;
let taskExecutions: TaskExecutions;

export class AppContext {
  //
  public static setAgentRegistration(reference: AgentRegistration): void {
    agentRegistration = reference;
  }
  public static getAgentRegistration(): AgentRegistration {
    return agentRegistration;
  }

  public static setTasks(reference: Tasks): void {
    tasks = reference;
  }
  public static getTasks(): Tasks {
    return tasks;
  }

  public static setTaskExecutions(reference: TaskExecutions): void {
    taskExecutions = reference;
  }
  public static getTaskExecutions(): TaskExecutions {
    return taskExecutions;
  }
}
