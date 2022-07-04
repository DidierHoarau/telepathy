<template>
  <nav>
    <div v-if="isAuthenticated">
      <div class="p-0">
        <div class="row p-0 m-0">
          <div class="col-3 col-md-12 nav-item p-2 text-center">
            <router-link to="/tasks">Tasks</router-link>
          </div>
          <div class="col-3 col-md-12 nav-item p-2 text-center">
            <router-link to="/agents">Agents</router-link>
          </div>
          <div class="col-3 col-md-12 nav-item p-2 text-center">
            <router-link to="/users">Users</router-link>
          </div>
          <div class="col-3 col-md-12 nav-item p-2 text-center">
            <router-link to="/users/login">Logout</router-link>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!isAuthenticated">
      <div class="container">
        <div class="row">
          <div class="col-12 nav-item p-2 text-center">
            <router-link to="/users/login">Login</router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { EventBus, EventTypes } from "../services/EventBus";
import { AuthService } from "../services/AuthService";
import router from "../router";

export default {
  name: "NavigationPanel",
  data() {
    return {
      isAuthenticated: false,
    };
  },
  async created() {
    EventBus.on(EventTypes.AUTH_UPDATED, async () => {
      this.isAuthenticated = await AuthService.isAuthenticated();
    });
    this.isAuthenticated = await AuthService.isAuthenticated();
    if (!this.isAuthenticated) {
      router.push({ path: "/users/login" });
    }
  },
  methods: {},
};
</script>

<style scoped>
.nav-item a {
  color: #eee;
  font-weight: bold;
  text-decoration: none;
  font-size: 0.8rem;
}
</style>
