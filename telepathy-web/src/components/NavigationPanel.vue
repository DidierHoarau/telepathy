<template>
  <nav>
    <div class="navigation_container" v-if="isAuthenticated">
      <router-link class="navigation_item" id="navigationTaskList" to="/tasks">Tasks</router-link>
      <router-link class="navigation_item" to="/agents">Agents</router-link>
      <router-link class="navigation_item" to="/users">Users</router-link>
      <router-link class="navigation_item" to="/users/login">Logout</router-link>
    </div>
    <div class="navigation_container" v-if="!isAuthenticated">
      <router-link class="navigation_item" to="/users/login">Login</router-link>
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
.navigation_container {
  display: grid;
  align-items: center;
}
.navigation_item {
  color: #eee;
  font-weight: bold;
  text-decoration: none;
  font-size: 0.8rem;
  text-align: center;
}

@media (max-width: 700px) {
  .navigation_container {
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    height: 100%;
  }
}

@media (min-width: 700px) {
  .navigation_container {
    grid-auto-rows: 4em;
    grid-auto-flow: row;
  }
}
</style>
