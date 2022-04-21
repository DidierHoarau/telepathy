import { v4 as uuidv4 } from "uuid";
import { TaskOutput } from "./taskOutput";

export class TaskExecution {
  //
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
    if (json.outputs) {
      taskExecution.outputs = json.outputs;
    }
    taskExecution.taskId = json.taskId;
    taskExecution.script = json.script;
    taskExecution.status = json.status;
    taskExecution.success = json.success;
    taskExecution.agentId = json.agentId;
    taskExecution.dateQueued = json.dateQueued;
    taskExecution.dateExecuting = json.dateExecuting;
    taskExecution.dateExecuted = json.dateExecuted;
    taskExecution.dateAgentAlive = json.dateAgentAlive;
    return taskExecution;
  }

  public version: number = 2;
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
  public dateAgentAlive: Date;
  public outputs: TaskOutput[];

  constructor() {
    this.id = uuidv4();
    this.outputs = [];
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
      dateAgentAlive: this.dateAgentAlive,
      outputs: this.outputs,
    };
  }
}
