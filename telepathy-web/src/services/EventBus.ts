import mitt from 'mitt';
export const EventBus = mitt();

export enum EventTypes {
  AUTH_UPDATED = 'AUTH_UPDATED',
  TASK_UPDATED = 'TASK_UPDATED',
  ALERT_MESSAGE = 'ALERT_MESSAGE',
  TASK_EXECUTION_TRIGGERED = 'TASK_EXECUTION_TRIGGERED',
}
