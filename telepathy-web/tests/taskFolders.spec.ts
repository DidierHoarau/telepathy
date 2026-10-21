import { describe, expect, test } from "vitest";
import { groupTasks, taskDisplayName, taskFolderName } from "~/utils/taskFolders";

describe("taskFolderName", () => {
  test("returns the folder prefix", () => {
    expect(taskFolderName("ops/cleanup")).toBe("ops");
  });

  test("returns an empty string when the task is not grouped", () => {
    expect(taskFolderName("cleanup")).toBe("");
  });

  test("keeps nested paths in the folder name", () => {
    expect(taskFolderName("ops/database/cleanup")).toBe("ops");
  });
});

describe("taskDisplayName", () => {
  test("strips the folder prefix", () => {
    expect(taskDisplayName("ops/database/cleanup")).toBe("database/cleanup");
  });

  test("returns the name unchanged without a prefix", () => {
    expect(taskDisplayName("cleanup")).toBe("cleanup");
  });
});

describe("groupTasks", () => {
  test("groups and sorts tasks by folder then name", () => {
    const groups = groupTasks([
      { id: "3", name: "ops/zeta", script: "" },
      { id: "1", name: "backup", script: "" },
      { id: "2", name: "ops/alpha", script: "" },
    ]);

    expect(groups.map((group) => group.name)).toEqual(["", "ops"]);
    expect(groups[0]!.tasks.map((task) => task.name)).toEqual(["backup"]);
    expect(groups[1]!.tasks.map((task) => task.name)).toEqual([
      "ops/alpha",
      "ops/zeta",
    ]);
  });

  test("returns an empty list for no tasks", () => {
    expect(groupTasks([])).toEqual([]);
  });
});
