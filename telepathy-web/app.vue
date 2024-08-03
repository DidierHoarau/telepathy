<template>
  <div>
    <VitePwaManifest />
    <div id="page_container">
      <header class="page_header">
        <a href="/"><h1>Telepathy</h1></a>
      </header>
      <NavigationPanel class="page_menu" />
      <div class="page_content">
        <NuxtPage class="page_content" />
      </div>
      <div class="page_footer" />
    </div>
    <div class="alert-messages"><AlertMessages /></div>
  </div>
</template>

<style>
/* Layout */

#page_container {
  width: auto;
  height: 100vh;
  display: grid;
  overflow: hidden;
  grid-template-rows: 3em 3em 1fr;
}

header,
main {
  padding: 0.5em;
}

#page-alert-messages {
  position: fixed;
  right: 3rem;
  bottom: 3rem;
  max-width: 80vw;
}

/* Common Component */

.actions i {
  font-size: 1.5em;
  cursor: pointer;
  margin-left: 0.5em;
  margin-right: 0.5em;
}

@media (prefers-color-scheme: dark) {
  .actions i {
    color: #bcc6ce;
  }
}
@media (prefers-color-scheme: light) {
  .actions i {
    color: #1d2832;
  }
}

/* Aninations */

.fade-in-slow {
  animation: fadeIn 2s;
}
.fade-in-fast {
  animation: fadeIn 0.5s;
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.blink {
  transition: all 1s ease-in-out;
  animation: blink normal 3s infinite ease-in-out;
}
@keyframes blink {
  0% {
    color: inherit;
  }
  50% {
    color: #039be5;
  }
  100% {
    color: inherit;
  }
}
</style>
