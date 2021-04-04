<template>
  <div>
    <header
      class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow"
    >
      <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="#">Telepathy</a>
    </header>

    <div class="p-0 m-0 main-content">
      <div class="row p-0 m-0">
        <div class="col-12 col-md-3 col-lg-2 p-0 m-0">
          <Navigation />
        </div>
        <div class="col-12 col-md-9 col-lg-10 p-4"><router-view /></div>
      </div>
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
#content {
  margin: 2rem;
}
.main-content {
  width: 100% !important;
}
.navbar {
  width: 100% !important;
}

.alert-messages {
  position: fixed;
  right: 3rem;
  bottom: 3rem;
  max-width: 80vw;
}
</style>
