<template>
  <form class="page" @submit.prevent="save">
    <PageHeader
      :eyebrow="isEdit ? 'Tasks' : 'New task'"
      :title="isEdit ? 'Edit task' : 'Create a task'"
      description="Tasks are shell scripts executed by an agent, on a schedule or on demand."
    >
      <button type="button" class="btn btn-secondary" @click="cancel">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary" :disabled="saving">
        <i class="bi bi-check-lg" aria-hidden="true"></i>
        {{ saving ? "Saving…" : isEdit ? "Save changes" : "Create task" }}
      </button>
    </PageHeader>

    <div v-if="loading"><Loading size="small" label="Loading task" /></div>

    <div v-else class="form-grid">
      <div class="form-column">
        <section class="form-card form-stack">
          <h2>Definition</h2>
          <div class="field">
            <label for="taskName">Name</label>
            <input
              id="taskName"
              v-model="form.name"
              type="text"
              placeholder="backup-database"
              autocomplete="off"
              required
            />
            <p class="helper-text">
              Prefix with a folder to group tasks, for example
              <code>ops/cleanup</code>.
            </p>
          </div>
          <div class="field">
            <label for="taskScript">Script</label>
            <textarea
              id="taskScript"
              v-model="form.script"
              class="script-input"
              spellcheck="false"
              placeholder="#!/bin/sh&#10;echo &quot;Hello from Telepathy&quot;"
              required
            />
            <p class="helper-text">
              Runs with the shell of the agent host, in its working directory.
            </p>
          </div>
        </section>

        <section class="form-card form-stack">
          <div class="section-heading">
            <h2>Outputs</h2>
            <button type="button" class="btn btn-ghost btn-sm" @click="addOutput">
              <i class="bi bi-plus-lg" aria-hidden="true"></i>
              Add output
            </button>
          </div>
          <p class="helper-text">
            Extract values from the logs with a regular expression; they are stored
            with each execution.
          </p>
          <div v-if="form.outputDefinitions.length" class="output-editor">
            <div class="output-columns" aria-hidden="true">
              <span>Name</span>
              <span>Pattern (RegEx)</span>
              <span />
            </div>
            <div
              v-for="output in form.outputDefinitions"
              :key="output.id"
              class="output-row-editor"
            >
              <input v-model="output.name" type="text" placeholder="Version" aria-label="Output name" />
              <input
                v-model="output.pattern"
                type="text"
                placeholder="version: (\\d+\\.\\d+)"
                aria-label="Output pattern"
              />
              <button
                type="button"
                class="icon-button"
                aria-label="Remove output"
                title="Remove output"
                @click="removeOutput(output.id)"
              >
                <i class="bi bi-trash" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          <p v-else class="helper-text">No outputs defined.</p>
        </section>
      </div>

      <div class="form-column">
        <section class="form-card form-stack">
          <h2>Schedule and routing</h2>
          <div class="field">
            <label for="taskSchedule">Cron schedule</label>
            <input
              id="taskSchedule"
              v-model="form.schedule"
              type="text"
              class="mono"
              placeholder="0 2 * * *"
            />
            <p class="helper-text">
              <code>minute hour day_of_month month day_of_week</code>. Leave empty
              to run only on demand.
            </p>
          </div>
          <div class="field">
            <label for="taskTag">Agent tag</label>
            <select id="taskTag" v-model="form.tag">
              <option value="">Any agent</option>
              <option v-for="tag in tags" :key="tag" :value="tag">{{ tag }}</option>
            </select>
            <p class="helper-text">
              Restrict execution to agents carrying this tag.
            </p>
          </div>
        </section>

        <section class="form-card form-stack">
          <div class="toggle-row">
            <div>
              <h2>Webhook</h2>
              <p class="helper-text">Trigger this task with an HTTP POST.</p>
            </div>
            <label class="switch">
              <input v-model="webhookEnabled" type="checkbox" @change="toggleWebhook" />
              Enabled
            </label>
          </div>
          <template v-if="webhookEnabled">
            <div class="webhook-field">
              <input :value="form.webhook" type="text" readonly aria-label="Webhook token" />
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                title="Copy webhook URL"
                @click="copyWebhook"
              >
                <i class="bi bi-clipboard" aria-hidden="true"></i>
                Copy URL
              </button>
            </div>
            <p class="helper-text mono break-all">{{ webhookEndpoint }}</p>
          </template>
        </section>

        <section v-if="isEdit" class="form-card form-stack danger-zone">
          <h2>Danger zone</h2>
          <p class="helper-text">
            Deleting a task also removes it from the scheduler. Execution history
            is kept.
          </p>
          <button
            type="button"
            class="btn btn-danger-ghost"
            :disabled="deleting"
            @click="remove"
          >
            <i class="bi bi-trash" aria-hidden="true"></i>
            {{ confirmingDelete ? "Confirm delete" : "Delete task" }}
          </button>
        </section>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Task, TaskOutputDefinition } from "~/types/telepathy";
import { api } from "~/services/Api";
import { notifyError, notifySuccess } from "~/utils/notify";
import { generateWebhookToken, webhookUrl } from "~/utils/webhook";

const props = defineProps<{ taskId?: string }>();
const isEdit = computed(() => Boolean(props.taskId));

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const confirmingDelete = ref(false);
const tags = ref<string[]>([]);
const origin = ref("");
const webhookEnabled = ref(false);
let confirmTimer: ReturnType<typeof setTimeout> | null = null;

const form = reactive<{
  name: string;
  script: string;
  schedule: string;
  tag: string;
  webhook: string;
  outputDefinitions: TaskOutputDefinition[];
}>({
  name: "",
  script: "",
  schedule: "",
  tag: "",
  webhook: "",
  outputDefinitions: [],
});

const webhookEndpoint = computed(() =>
  form.webhook ? webhookUrl(form.webhook, origin.value) : "",
);

function newOutput(): TaskOutputDefinition {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now() + Math.random()),
    name: "",
    pattern: "",
  };
}

function addOutput(): void {
  form.outputDefinitions.push(newOutput());
}

function removeOutput(id: string): void {
  form.outputDefinitions = form.outputDefinitions.filter((output) => output.id !== id);
}

function toggleWebhook(): void {
  form.webhook = webhookEnabled.value ? generateWebhookToken() : "";
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [tagsResponse, taskResponse] = await Promise.all([
      api.get("/agents/tags"),
      props.taskId ? api.get(`/tasks/${props.taskId}`) : Promise.resolve(null),
    ]);
    tags.value = tagsResponse.data ?? [];
    if (taskResponse) {
      const task = taskResponse.data as Task;
      form.name = task.name;
      form.script = task.script;
      form.schedule = task.schedule ?? "";
      form.tag = task.tag ?? "";
      form.webhook = task.webhook ?? "";
      form.outputDefinitions = (task.outputDefinitions ?? []).map((output) => ({
        ...output,
      }));
      webhookEnabled.value = Boolean(task.webhook);
    }
  } catch (error) {
    notifyError(error);
  } finally {
    loading.value = false;
  }
}

function validate(): boolean {
  if (!form.name.trim() || !form.script.trim()) {
    notifyError(new Error("Name and script are required"));
    return false;
  }
  return true;
}

async function save(): Promise<void> {
  if (!validate()) return;
  saving.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      script: form.script,
      schedule: form.schedule.trim(),
      tag: form.tag,
      webhook: form.webhook,
      outputDefinitions: form.outputDefinitions.filter(
        (output) => output.name || output.pattern,
      ),
    };
    if (isEdit.value) {
      await api.put(`/tasks/${props.taskId}`, payload);
      notifySuccess("Task updated");
    } else {
      await api.post("/tasks", payload);
      notifySuccess("Task created");
    }
    await navigateTo("/tasks");
  } catch (error) {
    notifyError(error);
  } finally {
    saving.value = false;
  }
}

async function remove(): Promise<void> {
  if (!confirmingDelete.value) {
    confirmingDelete.value = true;
    confirmTimer = setTimeout(() => {
      confirmingDelete.value = false;
    }, 4000);
    return;
  }
  if (confirmTimer) clearTimeout(confirmTimer);
  confirmingDelete.value = false;
  deleting.value = true;
  try {
    await api.delete(`/tasks/${props.taskId}`);
    notifySuccess("Task deleted");
    await navigateTo("/tasks");
  } catch (error) {
    notifyError(error);
  } finally {
    deleting.value = false;
  }
}

async function copyWebhook(): Promise<void> {
  try {
    await navigator.clipboard.writeText(webhookEndpoint.value);
    notifySuccess("Webhook URL copied");
  } catch {
    notifyError(new Error("Unable to copy the webhook URL"));
  }
}

function cancel(): void {
  navigateTo("/tasks");
}

onMounted(() => {
  origin.value = window.location.origin;
  load();
});

onUnmounted(() => {
  if (confirmTimer) clearTimeout(confirmTimer);
});
</script>

<style scoped>
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.section-heading h2 {
  margin-bottom: 0;
}

.output-columns {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.5rem;
  padding: 0 0.15rem;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.break-all {
  word-break: break-all;
}

.danger-zone {
  border-color: color-mix(in srgb, var(--color-danger) 35%, var(--color-border));
}
</style>
