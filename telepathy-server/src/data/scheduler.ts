import { Span } from "@opentelemetry/sdk-trace-base";
import * as cron from "node-cron";
import { AppContext } from "../appContext";
import { StandardTracer } from "../utils-std-ts/standardTracer";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("data/scheduler");

export class Scheduler {
  //
  private scheduledCrons: any[] = [];

  public async calculate(context: Span): Promise<void> {
    const span = StandardTracer.startSpan("Scheduler_calculate", context);
    logger.info("Re-calculating schedules");
    for (const scheduledCron of this.scheduledCrons) {
      scheduledCron.destroy();
    }
    this.scheduledCrons = [];
    const tasks = await AppContext.getTasks().list(context);
    for (const task of tasks) {
      if (task.schedule) {
        logger.info(`Scheduling task ${task.id}: ${task.schedule}`);
        const newScheduleCron = cron.schedule(task.schedule, () => {
          this.execute(span, task.id);
        });
        this.scheduledCrons.push(newScheduleCron);
      }
    }
    span.end();
  }

  private async execute(context: Span, taskId: string): Promise<void> {
    const span = StandardTracer.startSpan("Scheduler_execute", context);
    const task = await AppContext.getTasks().get(span, taskId);
    logger.info(`Schedule reached for ${task.id}`);
    AppContext.getTaskExecutions().createFromTaskId(span, taskId);
    span.end();
  }
}
