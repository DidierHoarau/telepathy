import { v4 as uuidv4 } from 'uuid';
import { TaskOutput } from './taskOutput';

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
  public dateQueued: Date;
  public dateExecuting: Date;
  public dateExecuted: Date;

  constructor() {
    this.id = uuidv4();
    this.outputRaw = '';
    this.outputs = [];
  }
}
