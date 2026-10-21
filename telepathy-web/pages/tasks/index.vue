<template>
  <div class="page">
    <PageHeader
      eyebrow="Automation"
      title="Tasks"
      description="Shell scripts scheduled on your agents, triggered by cron or on demand."
    >
      <NuxtLink to="/tasks/new" class="btn btn-primary">
        <i class="bi bi-plus-lg" aria-hidden="true"></i>
        New task
      </NuxtLink>
    </PageHeader>

    <div class="toolbar">
      <div class="search-field">
        <i class="bi bi-search" aria-hidden="true"></i>
        <input
          v-model="search"
          type="search"
          placeholder="Search tasks, tags or schedules"
          aria-label="Search tasks"
        />
      </div>
      <span class="toolbar-count">{{ tasks.length }} task{{ tasks.length === 1 ? "" : "s" }}</span>
    </div>

    <div v-if="loading" class="page-loading">
      <Loading size="small" label="Loading tasks" />
    </div>

    <template v-else>
      <EmptyState
        v-if="tasks.length === 0"
        icon="bi bi-terminal"
        title="No tasks yet"
        description="Create your first task to run a script on an agent, on a schedule or from a webhook."
      >
        <NuxtLink to="/tasks/new" class="btn btn-primary">
          <i class="bi bi-plus-lg" aria-hidden="true"></i>
          Create a task
        </NuxtLink>
      </EmptyState>

      <EmptyState
        v-else-if="groups.length === 0"
        icon="bi bi-search"
        title="No matching tasks"
        :description="`Nothing matches “${search}”. Try another name or tag.`"
      />

      <div v-else class="task-groups">
        <section v-for="group in groups" :key="group.name || 'ungrouped'">
          <header class="task-group-header">
            <div class="task-group-title">
              <i
                :class="group.name ? 'bi bi-folder2-open' : 'bi bi-collection'"
                aria-hidden="true"
              ></i>
              <h2>{{ group.name || "General" }}</h2>
              <span class="count-badge">{{ group.tasks.length }}</span>
            </div>
          </header>
          <div class="task-grid">
            <TaskCard
              v-for="task in group.tasks"
              :key="task.id"
              :task="task"
              @open="openTask(task)"
              @edit="editTask(task)"
            />
          </div>
        </section>
      </div>
    </template>

    <TaskExecutions
      v-if="selectedTask"
      :key="selectedTask.id"
      :task="selectedTask"
      @close="selectedTask = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { Task } from "~/types/telepathy";
import { api } from "~/services/Api";
import { groupTasks } from "~/utils/taskFolders";
import { notifyError } from "~/utils/notify";

useHead({ title: "Tasks · Telepathy" });

const tasks = ref<Task[]>([]);
const loading = ref(true);
const search = ref("");
const selectedTask = ref<Task | null>(null);

const groups = computed(() => {
  const query = search.value.trim().toLowerCase();
  const filtered = query
    ? tasks.value.filter((task) =>
        [task.name, task.tag, task.schedule]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query)),
      )
    : tasks.value;
  return groupTasks(filtered);
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const { data } = await api.get("/tasks");
    tasks.value = data?.tasks ?? [];
  } catch (error) {
    notifyError(error);
  } finally {
    loading.value = false;
  }
}

function openTask(task: Task): void {
  selectedTask.value = task;
}

function editTask(task: Task): void {
  navigateTo(`/tasks/${task.id}/edit`);
}

onMounted(load);
</script>
