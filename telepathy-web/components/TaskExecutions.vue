<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div class="drawer-backdrop" @click="emit('close')" />
    </Transition>
    <Transition name="drawer" appear>
      <aside
        class="drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="`Executions of ${displayName}`"
      >
        <div class="execution-panel">
          <header class="execution-header">
            <div class="execution-heading">
              <p class="eyebrow">Execution history</p>
              <h2>{{ displayName }}</h2>
              <p v-if="folder" class="execution-task-path">{{ folder }}/</p>
            </div>
            <div class="execution-header-actions">
              <button
                type="button"
                class="icon-button"
                aria-label="Close execution panel"
                title="Close"
                @click="emit('close')"
              >
                <i class="bi bi-x-lg" aria-hidden="true"></i>
              </button>
            </div>
          </header>

          <div class="execution-content">
            <div v-if="loading"><Loading size="small" label="Loading executions" /></div>

            <template v-else-if="executions.length === 0">
              <div class="execution-empty">
                <span class="empty-state-icon"><i class="bi bi-inbox" aria-hidden="true"></i></span>
                <h3>No executions yet</h3>
                <p>Run this task to see its outputs and logs here.</p>
                <button type="button" class="btn btn-primary" :disabled="running" @click="run">
                  <i class="bi bi-play-fill" aria-hidden="true"></i>
                  {{ running ? "Starting…" : "Run task" }}
                </button>
              </div>
            </template>

            <template v-else>
              <div class="execution-toolbar">
                <div class="execution-nav" role="group" aria-label="Execution navigation">
                  <button
                    type="button"
                    class="icon-button"
                    aria-label="Newer execution"
                    title="Newer"
                    :disabled="position === 0"
                    @click="select(position - 1)"
                  >
                    <i class="bi bi-chevron-left" aria-hidden="true"></i>
                  </button>
                  <span class="execution-counter">{{ position + 1 }} / {{ executions.length }}</span>
                  <button
                    type="button"
                    class="icon-button"
                    aria-label="Older execution"
                    title="Older"
                    :disabled="position >= executions.length - 1"
                    @click="select(position + 1)"
                  >
                    <i class="bi bi-chevron-right" aria-hidden="true"></i>
                  </button>
                </div>

                <div class="execution-toolbar-actions">
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm"
                    :disabled="!logs"
                    @click="copyLogs"
                  >
                    <i class="bi bi-clipboard" aria-hidden="true"></i>
                    Copy logs
                  </button>
                  <button
                    v-if="cancelable"
                    type="button"
                    class="btn btn-danger-ghost btn-sm"
                    :disabled="cancelling"
                    @click="cancel"
                  >
                    <i class="bi bi-stop-circle" aria-hidden="true"></i>
                    {{ confirmingCancel ? "Confirm cancel" : "Cancel" }}
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    :disabled="running || isRunning"
                    @click="run"
                  >
                    <i class="bi bi-play-fill" aria-hidden="true"></i>
                    {{ running ? "Starting…" : "Run again" }}
                  </button>
                </div>
              </div>

              <div v-if="current" class="execution-summary">
                <span class="status-pill" :class="`status-${tone}`">
                  <span class="status-dot" aria-hidden="true"></span>
                  {{ label }}
                </span>
                <span class="execution-time">
                  <i class="bi bi-calendar3" aria-hidden="true"></i>
                  {{ formatDateTime(executionTimestamp(current)) }}
                </span>
                <span v-if="current.agentId" class="execution-agent">
                  <i class="bi bi-cpu" aria-hidden="true"></i>
                  {{ current.agentId }}
                </span>
                <span v-if="current.tag" class="chip">{{ current.tag }}</span>
              </div>

              <section v-if="outputs.length" class="execution-outputs">
                <h3>Outputs</h3>
                <dl class="output-grid">
                  <div v-for="output in outputs" :key="output.id" class="output-item">
                    <dt>{{ output.name }}</dt>
                    <dd>{{ output.value }}</dd>
                  </div>
                </dl>
              </section>

              <section class="execution-logs">
                <div class="section-title">
                  <h3>Logs</h3>
                  <span v-if="logsLoading" class="helper-text">Refreshing…</span>
                </div>
                <pre v-if="logs">{{ logs }}</pre>
                <p v-else class="helper-text">No logs recorded for this execution.</p>
              </section>
            </template>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
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
import { formatDateTime } from "~/utils/time";
import { taskDisplayName, taskFolderName } from "~/utils/taskFolders";
import { notifyError, notifySuccess } from "~/utils/notify";

const props = defineProps<{ task: Task }>();
const emit = defineEmits<{ close: [] }>();

const executions = ref<TaskExecution[]>([]);
const current = ref<TaskExecution | null>(null);
const position = ref(0);
const logs = ref("");
const loading = ref(true);
const logsLoading = ref(false);
const running = ref(false);
const cancelling = ref(false);
const confirmingCancel = ref(false);
let pollTimer: ReturnType<typeof setInterval> | null = null;
let confirmTimer: ReturnType<typeof setTimeout> | null = null;

const displayName = computed(() => taskDisplayName(props.task.name));
const folder = computed(() => taskFolderName(props.task.name));
const outputs = computed(() => current.value?.outputs ?? []);
const tone = computed(() => executionState(current.value));
const label = computed(() => executionLabel(current.value));
const isRunning = computed(() => isExecutionActive(current.value));
const cancelable = computed(() => ["queued", "executing"].includes(current.value?.status ?? ""));

async function loadHistory(): Promise<void> {
  loading.value = true;
  try {
    const { data } = await api.get(`/tasks/${props.task.id}/executions`);
    executions.value = data?.task_executions ?? [];
    if (executions.value.length > 0) {
      position.value = Math.min(position.value, executions.value.length - 1);
      await select(position.value);
    } else {
      current.value = null;
      logs.value = "";
    }
  } catch (error) {
    notifyError(error);
  } finally {
    loading.value = false;
  }
}

async function select(index: number): Promise<void> {
  if (index < 0 || index >= executions.value.length) return;
  const execution = executions.value[index];
  if (!execution) return;
  position.value = index;
  current.value = execution;
  await loadLogs();
}

async function loadLogs(): Promise<void> {
  const execution = current.value;
  if (!execution) return;
  logsLoading.value = true;
  try {
    const { data } = await api.get(`/tasks/${props.task.id}/executions/${execution.id}/logs`);
    if (current.value?.id === execution.id) logs.value = data?.logs ?? "";
  } catch {
    // Logs are best-effort; a deleted execution is reported by the refresh below.
  } finally {
    logsLoading.value = false;
  }
}

async function refresh(): Promise<void> {
  const execution = current.value;
  if (!execution || document.visibilityState === "hidden") return;
  try {
    const { data } = await api.get<TaskExecution>(
      `/tasks/${props.task.id}/executions/${execution.id}`,
    );
    if (current.value?.id === data.id) {
      current.value = data;
      if (!isExecutionActive(data)) {
        const index = executions.value.findIndex((item) => item.id === data.id);
        if (index !== -1) executions.value[index] = data;
      }
    }
    if (isExecutionActive(data)) await loadLogs();
  } catch {
    // Keep the drawer stable; transient polling failures are retried.
  }
}

async function run(): Promise<void> {
  running.value = true;
  try {
    await api.post(`/tasks/${props.task.id}/executions`, {});
    notifySuccess("Task queued");
    position.value = 0;
    await loadHistory();
  } catch (error) {
    notifyError(error);
  } finally {
    running.value = false;
  }
}

async function cancel(): Promise<void> {
  if (!current.value) return;
  if (!confirmingCancel.value) {
    confirmingCancel.value = true;
    confirmTimer = setTimeout(() => {
      confirmingCancel.value = false;
    }, 4000);
    return;
  }
  if (confirmTimer) clearTimeout(confirmTimer);
  confirmingCancel.value = false;
  cancelling.value = true;
  try {
    await api.post(`/tasks/${props.task.id}/executions/${current.value.id}/cancellation`, {});
    notifySuccess("Cancellation requested");
    await refresh();
  } catch (error) {
    notifyError(error);
  } finally {
    cancelling.value = false;
  }
}

async function copyLogs(): Promise<void> {
  try {
    await navigator.clipboard.writeText(logs.value);
    notifySuccess("Logs copied");
  } catch {
    notifyError(new Error("Unable to copy logs"));
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") emit("close");
}

onMounted(() => {
  loadHistory();
  pollTimer = setInterval(refresh, 5000);
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  if (confirmTimer) clearTimeout(confirmTimer);
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.execution-header-actions {
  display: flex;
  gap: 0.25rem;
}

.execution-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: var(--space-2xl) var(--space-base);
  text-align: center;
}

.execution-empty h3 {
  font-size: 1rem;
}

.execution-empty p {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.execution-empty .btn {
  margin-top: 0.75rem;
}
</style>
