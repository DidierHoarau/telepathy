import { Task } from "./task";
import * as fs from "fs-extra";
import { config } from "../config";
import * as _ from "lodash";

export class Tasks {
  //
  public tasks: Task[];
  constructor() {
    if (fs.existsSync(`${config.DATA_DIR}/tasks.json`)) {
      fs.readJSON(`${config.DATA_DIR}/tasks.json`).then((data) => {
        this.tasks = data;
      });
    } else {
      this.tasks = [];
      this.save();
    }
  }

  public async get(id: string): Promise<Task> {
    return _.find(this.tasks, {
      id,
    }) as Task;
  }

  public async list(): Promise<Task[]> {
    return this.tasks;
  }

  async add(task: Task): Promise<void> {
    this.tasks.push(task);
    await this.save();
  }

  async save(): Promise<void> {
    await fs.writeJSON(`${config.DATA_DIR}/tasks.json`, this.tasks);
  }
}
