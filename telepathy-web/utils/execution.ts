import type { TaskExecution } from "~/types/telepathy";

export type ExecutionState =
  | "queued"
  | "running"
  | "success"
  | "failed"
  | "cancelled"
  | "warning";

export function executionState(
  execution?: TaskExecution | null,
): ExecutionState {
  switch (execution?.status) {
    case "queued":
      return "queued";
    case "executing":
      return "running";
    case "cancelling":
      return "warning";
    case "cancelled":
      return "cancelled";
    case "failed":
      return "failed";
    case "executed":
      return execution.success === false ? "failed" : "success";
    default:
      return "queued";
  }
}

export function executionLabel(execution?: TaskExecution | null): string {
  switch (execution?.status) {
    case "queued":
      return "Queued";
    case "executing":
      return "Running";
    case "cancelling":
      return "Cancelling";
    case "cancelled":
      return "Cancelled";
    case "failed":
      return "Failed";
    case "executed":
      return execution.success === false ? "Failed" : "Succeeded";
    default:
      return "Unknown";
  }
}

export function executionTimestamp(
  execution?: TaskExecution | null,
): string | undefined {
  return (
    execution?.dateExecuted ??
    execution?.dateExecuting ??
    execution?.dateQueued
  );
}

export function isExecutionActive(
  execution?: TaskExecution | null,
): boolean {
  return ["queued", "executing", "cancelling"].includes(
    execution?.status ?? "",
  );
}
