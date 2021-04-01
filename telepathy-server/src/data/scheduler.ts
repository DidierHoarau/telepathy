import * as cron from "node-cron";
import { AppContext } from "../appContext";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("data/scheduler");

export class Scheduler {
  //
  private scheduledCrons: any[] = [];

  public async calculate(): Promise<void> {
    logger.info("Re-calculating schedules");
    for (const scheduledCron of this.scheduledCrons) {
      scheduledCron.destroy();
    }
    this.scheduledCrons = [];
    const tasks = await AppContext.getTasks().list();
    for (const task of tasks) {
      if (task.schedule) {
        logger.info(`Scheduling task ${task.id}: ${task.schedule}`);
        const newScheduleCron = cron.schedule(task.schedule, () => {
          this.execute(task.id);
        });
        this.scheduledCrons.push(newScheduleCron);
      }
    }
  }

  private async execute(taskId: string): Promise<void> {
    const task = await AppContext.getTasks().get(taskId);
    logger.info(`Schedule reached for ${task.id}`);
    AppContext.getTaskExecutions().createFromTaskId(taskId);
  }
}
