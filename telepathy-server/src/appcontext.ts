import { Agents } from "./agents/agents";
import { TaskExecutions } from "./tasks/taskExecutions";
import { Tasks } from "./tasks/tasks";

let agents: Agents;
let tasks: Tasks;
let taskExecutions: TaskExecutions;

export class AppContext {
  //
  public static setAgents(reference: Agents): void {
    agents = reference;
  }
  public static getAgents(): Agents {
    return agents;
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
