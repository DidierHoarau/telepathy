import axios from "axios";
import {
  EventBus,
  EventTypes,
} from "@devopsplaybook.io/common-web/composables/EventBus.ts";

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; Error?: string }
      | undefined;
    return data?.error ?? data?.Error ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export function notifyError(error: unknown): void {
  EventBus.emit(EventTypes.ALERT_MESSAGE, {
    type: "error",
    text: errorMessage(error),
  });
}

export function notifySuccess(text: string): void {
  EventBus.emit(EventTypes.ALERT_MESSAGE, { type: "success", text });
}
