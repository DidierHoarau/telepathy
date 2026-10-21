import { describe, expect, test } from "vitest";
import {
  executionLabel,
  executionState,
  executionTimestamp,
  isExecutionActive,
} from "~/utils/execution";
import type { TaskExecution } from "~/types/telepathy";

function execution(status: string, success?: boolean): TaskExecution {
  return { id: "execution-1", taskId: "task-1", status, success };
}

describe("executionState", () => {
  test("maps server statuses to UI states", () => {
    expect(executionState(execution("queued"))).toBe("queued");
    expect(executionState(execution("executing"))).toBe("running");
    expect(executionState(execution("cancelling"))).toBe("warning");
    expect(executionState(execution("cancelled"))).toBe("cancelled");
    expect(executionState(execution("failed"))).toBe("failed");
    expect(executionState(execution("executed", true))).toBe("success");
    expect(executionState(execution("executed", false))).toBe("failed");
  });

  test("defaults to queued for unknown executions", () => {
    expect(executionState(null)).toBe("queued");
  });
});

describe("executionLabel", () => {
  test("returns human readable labels", () => {
    expect(executionLabel(execution("executing"))).toBe("Running");
    expect(executionLabel(execution("executed", true))).toBe("Succeeded");
    expect(executionLabel(execution("executed", false))).toBe("Failed");
    expect(executionLabel(null)).toBe("Unknown");
  });
});

describe("executionTimestamp", () => {
  test("prefers the most advanced timestamp", () => {
    const value: TaskExecution = {
      id: "execution-1",
      taskId: "task-1",
      status: "executed",
      dateQueued: "2026-10-21T10:00:00Z",
      dateExecuting: "2026-10-21T10:01:00Z",
      dateExecuted: "2026-10-21T10:02:00Z",
    };
    expect(executionTimestamp(value)).toBe("2026-10-21T10:02:00Z");
    expect(executionTimestamp(execution("queued"))).toBeUndefined();
  });
});

describe("isExecutionActive", () => {
  test("is true while queued, executing or cancelling", () => {
    expect(isExecutionActive(execution("queued"))).toBe(true);
    expect(isExecutionActive(execution("executing"))).toBe(true);
    expect(isExecutionActive(execution("cancelling"))).toBe(true);
    expect(isExecutionActive(execution("executed", true))).toBe(false);
    expect(isExecutionActive(null)).toBe(false);
  });
});
