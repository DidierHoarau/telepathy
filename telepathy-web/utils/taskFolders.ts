import type { Task } from "~/types/telepathy";

export interface TaskFolder {
  name: string;
  tasks: Task[];
}

/** Folder prefix of a task name (`ops/cleanup` -> `ops`), or "" when ungrouped. */
export function taskFolderName(name: string): string {
  const separator = name.indexOf("/");
  return separator > 0 ? name.slice(0, separator) : "";
}

/** Task name without its folder prefix (`ops/cleanup` -> `cleanup`). */
export function taskDisplayName(name: string): string {
  const separator = name.indexOf("/");
  return separator >= 0 ? name.slice(separator + 1) : name;
}

export function groupTasks(tasks: Task[]): TaskFolder[] {
  const folders = new Map<string, Task[]>();

  for (const task of [...tasks].sort((a, b) => a.name.localeCompare(b.name))) {
    const folder = taskFolderName(task.name);
    const folderTasks = folders.get(folder) ?? [];
    folderTasks.push(task);
    folders.set(folder, folderTasks);
  }

  return [...folders.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, folderTasks]) => ({ name, tasks: folderTasks }));
}
