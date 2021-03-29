import { Agents } from "./agents/agents";
import { TaskExecutions } from "./tasks/taskExecutions";
import { Tasks } from "./tasks/tasks";
import { Users } from "./users/users";

let agents: Agents;
let tasks: Tasks;
let users: Users;
let taskExecutions: TaskExecutions;

export class AppContext {
  //
  public static setUsers(reference: Users): void {
    users = reference;
  }
  public static getUsers(): Users {
    return users;
  }

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
