<template>
  <div>
    <div class="page_container">
      <header class="page_header navbar navbar-dark bg-dark flex-md-nowrap">
        <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="#"
          >Telepathy</a
        >
      </header>
      <Navigation class="page_menu" />
      <router-view class="page_content" />
      <div class="page_footer" />
    </div>
    <div class="alert-messages"><AlertMessages /></div>
  </div>
</template>

<script>
import Navigation from './components/Navigation.vue';
import AlertMessages from './components/AlertMessages.vue';
import Config from './Config.ts';

export default {
  name: 'App',
  components: {
    Navigation,
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
    background-color: #333;
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
    background-color: #2a2a2a;
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
    background-color: #333;
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
    background-color: #2a2a2a;
  }
}

.alert-messages {
  position: fixed;
  right: 3rem;
  bottom: 3rem;
  max-width: 80vw;
}
</style>
