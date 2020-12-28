import { Task } from "./task";
import * as fs from "fs-extra";
import { config } from "../config";

export class Tasks {
  //
  public tasks: Task[];
  constructor() {
    if (fs.existsSync(`${config.DATA_DIR}/task.json`)) {
      fs.readJSON(`${config.DATA_DIR}/task.json`).then((data) => {
        this.tasks = data;
      });
    } else {
      this.tasks = [];
      this.save();
    }
  }

  public async list(): Promise<Task[]> {
    return this.tasks;
  }

  async save(): Promise<void> {
    await fs.writeJSON(`${config.DATA_DIR}/task.json`, this.tasks);
  }
}
