import * as fs from 'fs-extra';
import * as _ from 'lodash';
import { TaskExecution } from '../common-model/taskExecution';
import { config } from '../config';

export class TaskExecutions {
  //
  public taskExecutions: TaskExecution[];

  constructor() {
    if (fs.existsSync(`${config.DATA_DIR}/task-executions.json`)) {
      fs.readJSON(`${config.DATA_DIR}/task-executions.json`).then((data) => {
        this.taskExecutions = data;
      });
    } else {
      this.taskExecutions = [];
      this.save();
    }
  }

  public async get(id: string): Promise<TaskExecution> {
    return _.find(this.taskExecutions, {
      id,
    }) as TaskExecution;
  }

  public async list(): Promise<TaskExecution[]> {
    return this.taskExecutions;
  }

  public async add(taskExecution: TaskExecution): Promise<void> {
    this.taskExecutions.push(taskExecution);
    await this.save();
  }

  public async update(
    id: string,
    taskExecutionUpdate: TaskExecution
  ): Promise<void> {
    const taskExecution = await this.get(id);
    taskExecution.status = taskExecutionUpdate.status;
    taskExecution.outputRaw = taskExecutionUpdate.outputRaw;
    taskExecution.outputs = taskExecutionUpdate.outputs;
    taskExecution.success = taskExecutionUpdate.success;
    taskExecution.agentId = taskExecutionUpdate.agentId;
    taskExecution.dateQueued = taskExecutionUpdate.dateQueued;
    taskExecution.dateExecuting = taskExecutionUpdate.dateExecuting;
    taskExecution.dateExecuted = taskExecutionUpdate.dateExecuted;
    await this.save();
  }

  public async save(): Promise<void> {
    await fs.writeJSON(
      `${config.DATA_DIR}/task-executions.json`,
      this.taskExecutions
    );
  }
}
