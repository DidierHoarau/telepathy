<template>
  <div class="page">
    <PageHeader
      eyebrow="Infrastructure"
      title="Agents"
      description="Agents connect to this server, register their tags and execute the tasks they are eligible for."
    >
      <button type="button" class="btn btn-secondary" :disabled="loading" @click="load">
        <i class="bi bi-arrow-clockwise" aria-hidden="true"></i>
        Refresh
      </button>
    </PageHeader>

    <div class="toolbar">
      <p class="page-subtitle">
        {{ agents.length }} agent{{ agents.length === 1 ? "" : "s" }} registered.
        An agent is considered online when it synced in the last 30 minutes.
      </p>
    </div>

    <div v-if="loading && agents.length === 0" class="page-loading">
      <Loading size="small" label="Loading agents" />
    </div>

    <EmptyState
      v-else-if="agents.length === 0"
      icon="bi bi-cpu"
      title="No agents connected"
      description="Start a Telepathy agent with this server's URL and AGENT_KEY; it will appear here after its first heartbeat."
    />

    <div v-else class="agent-grid">
      <AgentCard v-for="agent in agents" :key="agent.id" :agent="agent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Agent } from "~/types/telepathy";
import { api } from "~/services/Api";
import { notifyError } from "~/utils/notify";

useHead({ title: "Agents · Telepathy" });

const agents = ref<Agent[]>([]);
const loading = ref(true);
let refreshTimer: ReturnType<typeof setInterval> | null = null;

async function load(): Promise<void> {
  loading.value = true;
  try {
    const { data } = await api.get("/agents");
    agents.value = data?.agents ?? [];
  } catch (error) {
    notifyError(error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  load();
  refreshTimer = setInterval(() => {
    if (document.visibilityState === "visible") load();
  }, 30000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>
