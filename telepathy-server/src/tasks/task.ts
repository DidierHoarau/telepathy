import { TaskOutput } from "./taskOutput";

export class Task {
  //
  public script: string;
  public outputRaw: string;
  public outputs: TaskOutput[];
  public status: string;
  public success: boolean = false;
  public agentId: string;

  constructor() {
    this.outputRaw = "";
    this.outputs = [];
  }
}
