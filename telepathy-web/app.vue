<template>
  <div>
    <VitePwaManifest />
    <div id="page_container">
      <div id="page_header">
        <a href="/"><h1>Telepathy</h1></a>
      </div>
      <div id="page_menu">
        <NavigationPanel />
      </div>
      <div id="page_content">
        <NuxtPage />
      </div>
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
  grid-template-rows: auto auto 1fr;
}

#page_content {
  max-height: 100%;
  overflow: hidden;
}

#page-alert-messages {
  position: fixed;
  right: 3rem;
  bottom: 3rem;
  max-width: 80vw;
}

@media (min-width: 700px) {
  #page_container {
    width: auto;
    height: 100vh;
    display: grid;
    overflow: hidden;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto 1fr;
  }

  #page_menu {
    grid-column: 1;
    grid-row: 2;
  }

  #page_header {
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row: 1;
  }

  #page_content {
    grid-column: 2;
    grid-row: 2;
  }
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
