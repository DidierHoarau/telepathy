import { v4 as uuidv4 } from "uuid";

export class Task {
  //
  public id: string;
  public name: string;
  public script: string;
  public agentId: string;

  constructor() {
    this.id = uuidv4();
  }
}
