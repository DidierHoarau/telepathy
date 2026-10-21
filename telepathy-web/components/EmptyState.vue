<template>
  <div class="empty-state">
    <span class="empty-state-icon"><i :class="icon" aria-hidden="true"></i></span>
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    icon?: string;
  }>(),
  { icon: "bi bi-inbox", description: "" },
);
</script>
