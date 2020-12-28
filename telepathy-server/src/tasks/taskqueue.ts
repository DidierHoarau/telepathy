import { TaskQueueItem } from "./taskqueueitem";

export class TaskQueue {
  //
  public items: TaskQueueItem[];

  constructor() {
    this.items = [];
  }
}
  