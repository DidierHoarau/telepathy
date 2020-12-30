import { TaskOutput } from "./taskOutput";
import { v4 as uuidv4 } from "uuid";

export class TaskExecution {
  //
  public id: string;
  public taskId: string;
  public script: string;
  public outputRaw: string;
  public outputs: TaskOutput[];
  public status: string;
  public success: boolean = false;
  public agentId: string;

  constructor() {
    this.id = uuidv4();
    this.outputRaw = "";
    this.outputs = [];
  }
}
