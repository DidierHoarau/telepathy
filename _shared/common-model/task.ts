import { v4 as uuidv4 } from "uuid";

export class Task {
  //
  public id: string;
  public name: string;
  public script: string;
  public agentId: string;
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
    task.name = json.name;
    task.script = json.script;
    task.agentId = json.agentId;
    task.webhook = json.webhook;
    return task;
  }

  public toJson(): any {
    return {
      id: this.id,
      name: this.name,
      script: this.script,
      agentId: this.agentId,
      webhook: this.webhook,
    };
  }
}
