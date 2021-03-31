import { v4 as uuidv4 } from "uuid";

export class TaskExecution {
  //
  public id: string;
  public taskId: string;
  public script: string;
  public status: string;
  public success: boolean = false;
  public agentId: string;
  public tag: string;
  public dateQueued: Date;
  public dateExecuting: Date;
  public dateExecuted: Date;

  constructor() {
    this.id = uuidv4();
  }

  public static fromJson(json: any): TaskExecution {
    if (!json) {
      return null;
    }
    const taskExecution = new TaskExecution();
    if (json.id) {
      taskExecution.id = json.id;
    }
    if (json.tag) {
      taskExecution.tag = json.tag;
    }
    taskExecution.taskId = json.taskId;
    taskExecution.script = json.script;
    taskExecution.status = json.status;
    taskExecution.success = json.success;
    taskExecution.agentId = json.agentId;
    taskExecution.dateQueued = json.dateQueued;
    taskExecution.dateExecuting = json.dateExecuting;
    taskExecution.dateExecuted = json.dateExecuted;
    return taskExecution;
  }

  public toJson(): any {
    return {
      id: this.id,
      taskId: this.taskId,
      script: this.script,
      status: this.status,
      success: this.success,
      agentId: this.agentId,
      tag: this.tag,
      dateQueued: this.dateQueued,
      dateExecuting: this.dateExecuting,
      dateExecuted: this.dateExecuted,
    };
  }
}
