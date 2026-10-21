<template>
  <div id="page-layout">
    <VitePwaManifest />
    <header class="app-header">
      <Navigation />
    </header>
    <main class="app-main">
      <OfflineBanner />
      <div class="app-content">
        <NuxtPage />
      </div>
    </main>
    <AlertMessages id="page-alert-messages" />
  </div>
</template>

<script setup lang="ts">
useAppHeight();
</script>
