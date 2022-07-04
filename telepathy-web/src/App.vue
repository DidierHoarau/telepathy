<template>
  <div>
    <div class="page_container">
      <header class="page_header">
        <a href="/"><h1>Telepathy</h1></a>
      </header>
      <NavigationPanel class="page_menu" />
      <router-view class="page_content" />
      <div class="page_footer" />
    </div>
    <div class="alert-messages"><AlertMessages /></div>
  </div>
</template>

<script>
import NavigationPanel from "./components/NavigationPanel.vue";
import AlertMessages from "./components/AlertMessages.vue";
import Config from "./Config.ts";

export default {
  name: "App",
  components: {
    NavigationPanel,
    AlertMessages,
  },
  created() {
    Config.get();
  },
};
</script>

<style scoped>
@media (max-width: 700px) {
  .page_container {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 3rem 3rem 1fr 0.2rem;
    width: 100vw;
    height: 100vh;
  }
  .page_header {
    grid-column: 1;
    grid-row: 1;
  }

  .page_menu {
    grid-column: 1;
    grid-row: 2;
  }

  .page_content {
    grid-column: 1;
    grid-row: 3;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    height: auto;
  }

  .page_footer {
    grid-column: 1;
    grid-row: 4;
  }
}
@media (min-width: 700px) {
  .page_container {
    display: grid;
    grid-template-columns: 7rem 1fr;
    grid-template-rows: 3rem 1fr 1rem;
    width: 100vw;
    height: 100vh;
  }
  .page_header {
    grid-column: 1 / span 2;
    grid-row: 1;
  }

  .page_menu {
    grid-column: 1;
    grid-row: 2;
  }

  .page_content {
    grid-column: 2;
    grid-row: 2;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    height: auto;
  }

  .page_footer {
    grid-column: 1 / span 2;
    grid-row: 3;
  }
}

.page_container {
  overflow-x: hidden;
  overflow-y: hidden;
}

.page_header,
.page_footer {
  background-color: #212121;
}

.page_header a {
  text-decoration: none;
  color: #fff;
}

.page_header {
  padding-left: 2rem;
  padding-top: 0.5rem;
}

.page_header h1 {
  width: 90%;
}

.page_menu {
  background-color: #424242;
}

.alert-messages {
  position: fixed;
  right: 3rem;
  bottom: 3rem;
  max-width: 80vw;
}
</style>
