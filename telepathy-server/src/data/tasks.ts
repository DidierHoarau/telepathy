import * as fs from "fs-extra";
import * as _ from "lodash";
import { AppContext } from "../appContext";
import { Task } from "../common-model/task";

export class Tasks {
  //
  public tasks: Task[];

  constructor() {
    if (fs.existsSync(`${AppContext.getConfig().DATA_DIR}/tasks.json`)) {
      fs.readJSON(`${AppContext.getConfig().DATA_DIR}/tasks.json`).then((data) => {
        this.tasks = data;
      });
    } else {
      this.tasks = [];
      this.save();
    }
  }

  public async get(id: string): Promise<Task> {
    return Task.fromJson(
      _.find(this.tasks, {
        id,
      })
    );
  }

  public async update(id: string, taskUpdate: Task): Promise<void> {
    const task = _.find(this.tasks, {
      id,
    }) as Task;
    task.name = taskUpdate.name;
    task.script = taskUpdate.script;
    task.schedule = taskUpdate.schedule;
    task.tag = taskUpdate.tag;
    task.webhook = taskUpdate.webhook;
    task.outputDefinitions = taskUpdate.outputDefinitions;
    await this.save();
  }

  public async delete(id: string): Promise<void> {
    const position = _.findIndex(this.tasks, {
      id,
    });
    if (position >= 0) {
      this.tasks.splice(position, 1);
    }
    await this.save();
  }

  public async list(): Promise<Task[]> {
    return _.cloneDeep(this.tasks);
  }

  public async add(task: Task): Promise<void> {
    this.tasks.push(task);
    await this.save();
  }

  public async save(): Promise<void> {
    await fs.writeJSON(`${AppContext.getConfig().DATA_DIR}/tasks.json`, this.tasks);
  }
}
