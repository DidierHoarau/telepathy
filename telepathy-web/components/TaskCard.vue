<template>
  <article
    class="task-card"
    tabindex="0"
    @click="emit('open')"
    @keydown.enter.prevent="emit('open')"
    @keydown.space.prevent="emit('open')"
  >
    <div class="task-card-top">
      <span class="task-icon"><i class="bi bi-terminal" aria-hidden="true"></i></span>
      <div class="task-title">
        <h3 :title="task.name">{{ displayName }}</h3>
        <p v-if="folder" class="task-path">{{ folder }}/</p>
      </div>
      <span class="status-pill" :class="`status-${tone}`">
        <span class="status-dot" aria-hidden="true"></span>
        {{ label }}
      </span>
    </div>

    <div class="task-meta">
      <span v-if="task.schedule" class="meta-chip">
        <i class="bi bi-alarm" aria-hidden="true"></i>
        <code>{{ task.schedule }}</code>
      </span>
      <span v-else class="meta-chip">
        <i class="bi bi-lightning-charge" aria-hidden="true"></i>
        Manual trigger
      </span>
      <span v-if="task.tag" class="meta-chip">
        <i class="bi bi-tag" aria-hidden="true"></i>
        {{ task.tag }}
      </span>
    </div>

    <div class="last-run">
      <span v-if="lastExecution">
        <i class="bi bi-clock-history" aria-hidden="true"></i>
        Last run {{ formatRelativeTime(executionTimestamp(lastExecution)) }}
      </span>
      <span v-else>Never run</span>
      <span v-if="lastExecution?.agentId" class="agent">
        <i class="bi bi-cpu" aria-hidden="true"></i>
        {{ lastExecution.agentId }}
      </span>
    </div>

    <div v-if="outputs.length" class="output-list">
      <div v-for="output in outputs" :key="output.id" class="output-row">
        <span class="name">{{ output.name }}</span>
        <span class="value" :title="output.value">{{ output.value }}</span>
      </div>
    </div>

    <footer class="task-card-actions" @click.stop @keydown.stop>
      <button type="button" class="btn btn-ghost btn-sm" @click="emit('edit')">
        <i class="bi bi-pencil" aria-hidden="true"></i>
        Edit
      </button>
      <button
        type="button"
        class="btn btn-primary btn-sm"
        :disabled="running"
        @click="run"
      >
        <i class="bi bi-play-fill" aria-hidden="true"></i>
        {{ running ? "Starting…" : "Run" }}
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { Task, TaskExecution } from "~/types/telepathy";
import { api } from "~/services/Api";
import {
  executionLabel,
  executionState,
  executionTimestamp,
  isExecutionActive,
} from "~/utils/execution";
import { formatRelativeTime } from "~/utils/time";
import { taskDisplayName, taskFolderName } from "~/utils/taskFolders";
import { notifyError } from "~/utils/notify";

const props = defineProps<{ task: Task }>();
const emit = defineEmits<{ open: []; edit: [] }>();

const lastExecution = ref<TaskExecution | null>(null);
const running = ref(false);
let pollTimer: ReturnType<typeof setInterval> | null = null;

const displayName = computed(() => taskDisplayName(props.task.name));
const folder = computed(() => taskFolderName(props.task.name));
const tone = computed(() =>
  lastExecution.value ? executionState(lastExecution.value) : "neutral",
);
const label = computed(() =>
  lastExecution.value ? executionLabel(lastExecution.value) : "New",
);
const outputs = computed(() => lastExecution.value?.outputs?.slice(0, 3) ?? []);

async function loadLastExecution(): Promise<void> {
  if (document.visibilityState === "hidden") return;
  try {
    const { data } = await api.get(`/tasks/${props.task.id}/executions`);
    lastExecution.value = data?.task_executions?.[0] ?? null;
  } catch {
    // Keep the last known state; the execution drawer reports API errors.
  }
}

async function run(): Promise<void> {
  running.value = true;
  try {
    await api.post(`/tasks/${props.task.id}/executions`, {});
    emit("open");
    await loadLastExecution();
  } catch (error) {
    notifyError(error);
  } finally {
    running.value = false;
  }
}

onMounted(() => {
  loadLastExecution();
  pollTimer = setInterval(() => {
    if (isExecutionActive(lastExecution.value)) loadLastExecution();
    else if (document.visibilityState === "visible" && lastExecution.value === null) {
      loadLastExecution();
    }
  }, 15000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>
