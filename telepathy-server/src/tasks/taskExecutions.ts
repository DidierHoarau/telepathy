import * as fs from "fs-extra";
import { config } from "../config";
import { TaskExecution } from "./taskExecution";
import * as _ from "lodash";

export class TaskExecutions {
  //
  public taskExecutions: TaskExecution[];

  constructor() {
    if (fs.existsSync(`${config.DATA_DIR}/task-executions.json`)) {
      fs.readJSON(`${config.DATA_DIR}/task-executions.json`).then((data) => {
        this.taskExecutions = data;
      });
    } else {
      this.taskExecutions = [];
      this.save();
    }
  }

  public async get(id: string): Promise<TaskExecution> {
    return _.find(this.taskExecutions, {
      id,
    }) as TaskExecution;
  }

  public async list(): Promise<TaskExecution[]> {
    return this.taskExecutions;
  }

  async add(taskExecution: TaskExecution): Promise<void> {
    this.taskExecutions.push(taskExecution);
    await this.save();
  }

  async save(): Promise<void> {
    await fs.writeJSON(
      `${config.DATA_DIR}/task-executions.json`,
      this.taskExecutions
    );
  }
}
