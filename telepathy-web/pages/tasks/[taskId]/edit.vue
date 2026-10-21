<template>
  <TaskForm :task-id="taskId" />
</template>

<script setup lang="ts">
useHead({ title: "Edit task · Telepathy" });

const route = useRoute();
const taskId = computed(() => String(route.params.taskId ?? ""));
</script>
