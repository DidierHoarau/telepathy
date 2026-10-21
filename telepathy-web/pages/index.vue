<template>
  <div class="splash">
    <img src="/icon.png" alt="" />
    <p class="muted">Loading Telepathy…</p>
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  navigateTo("/tasks");
});
</script>
