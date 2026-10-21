<template>
  <article class="agent-card">
    <div class="agent-card-top">
      <span class="agent-icon"><i class="bi bi-cpu" aria-hidden="true"></i></span>
      <h3 :title="agent.id">{{ agent.id }}</h3>
      <span class="status-pill" :class="online ? 'status-success' : 'status-neutral'">
        <span class="status-dot" aria-hidden="true"></span>
        {{ online ? "Online" : "Offline" }}
      </span>
    </div>
    <div class="chip-row">
      <span v-for="tag in agent.tags" :key="tag" class="chip">
        <i class="bi bi-tag" aria-hidden="true"></i>
        {{ tag }}
      </span>
      <span v-if="!agent.tags?.length" class="chip">No tags</span>
    </div>
    <p class="agent-meta">
      <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
      Last seen {{ lastSeen }}
    </p>
  </article>
</template>

<script setup lang="ts">
import type { Agent } from "~/types/telepathy";
import { isAgentOnline } from "~/utils/agent";
import { formatRelativeTime } from "~/utils/time";

const props = defineProps<{ agent: Agent }>();

const online = computed(() => isAgentOnline(props.agent, Date.now()));
const lastSeen = computed(() =>
  props.agent.lastSyncDate
    ? formatRelativeTime(props.agent.lastSyncDate)
    : "unknown",
);
</script>
