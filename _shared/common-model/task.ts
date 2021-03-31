import { v4 as uuidv4 } from "uuid";

export class Task {
  //
  public id: string;
  public name: string;
  public script: string;
  public tag: string;
  public webhook: string;

  constructor() {
    this.id = uuidv4();
  }

  public static fromJson(json: any): Task {
    if (!json) {
      return null;
    }
    const task = new Task();
    if (json.id) {
      task.id = json.id;
    }
    if (json.tag) {
      task.tag = json.tag;
    }
    task.name = json.name;
    task.script = json.script;
    task.webhook = json.webhook;

    return task;
  }

  public toJson(): any {
    return {
      id: this.id,
      name: this.name,
      script: this.script,
      tag: this.tag,
      webhook: this.webhook,
    };
  }
}
