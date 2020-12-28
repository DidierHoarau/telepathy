import { TaskOutput } from "./taskoutput";

export class Task {
  //
  public script: Date;
  public outputRaw: string;
  public outputs: TaskOutput[];

  constructor() {
    this.outputRaw = "";
    this.outputs = [];
  }
}
  