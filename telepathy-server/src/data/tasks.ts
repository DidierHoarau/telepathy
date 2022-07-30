import * as _ from "lodash";
import { Task } from "../common-model/task";
import { FileDBUtils } from "./fileDbUtils";

export class Tasks {
  //
  public tasks: Task[];

  public async load(): Promise<void> {
    this.tasks = await FileDBUtils.load("tasks", []);
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
    await FileDBUtils.save("tasks", this.tasks);
  }
}
