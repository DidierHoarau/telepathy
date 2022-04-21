import { Agents } from "./data/agents";
import { Scheduler } from "./data/scheduler";
import { TaskExecutions } from "./data/taskExecutions";
import { Tasks } from "./data/tasks";
import { Users } from "./data/users";
import { Config } from "./config";

let agents: Agents;
let tasks: Tasks;
let users: Users;
let config: Config;
let taskExecutions: TaskExecutions;
let scheduler: Scheduler;

export class AppContext {
  //
  public static setConfig(reference: Config): void {
    config = reference;
  }
  public static getConfig(): Config {
    return config;
  }

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

  public static setScheduler(reference: Scheduler): void {
    scheduler = reference;
  }
  public static getScheduler(): Scheduler {
    return scheduler;
  }
}
