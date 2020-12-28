import { Task } from "./task";
import * as fs from "fs-extra";
import { config } from "../config";

export class TaskExecutions {
  //
  public taskExecutions: Task[];
  constructor() {
    if (fs.existsSync(`${config.DATA_DIR}/task-executions.json`)) {
      fs.readJSON(`${config.DATA_DIR}/task-executions.json`);
    } else {
      this.taskExecutions = [];
      this.save();
    }
  }

  async save(): Promise<void> {
    await fs.writeJSON(
      `${config.DATA_DIR}/task-executions.json`,
      this.taskExecutions
    );
  }
}
