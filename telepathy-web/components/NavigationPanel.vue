<template>
  <nav>
    <div class="navigation_container" v-if="isAuthenticated">
      <router-link class="navigation_item" id="navigationTaskList" to="/tasks"
        ><i class="bi bi-gear-wide-connected"></i>&nbsp;Tasks</router-link
      >
      <router-link class="navigation_item" to="/agents"><i class="bi bi-pc"></i>&nbsp;Agents</router-link>
      <router-link class="navigation_item" to="/users"><i class="bi bi-people-fill"></i>&nbsp;Users</router-link>
      <router-link class="navigation_item" to="/users/profile"
        ><i class="bi bi-person-fill"></i>&nbsp;Profile</router-link
      >
    </div>
    <div class="navigation_container" v-if="!isAuthenticated">
      <router-link class="navigation_item" to="/users/login">Login</router-link>
    </div>
  </nav>
</template>

<script>
import { EventBus, EventTypes, handleError } from "~~/services/EventBus";
import { AuthService } from "~~/services/AuthService";
import axios from "axios";

export default {
  name: "NavigationPanel",
  data() {
    return {
      isAuthenticated: false,
    };
  },
  async created() {
    await axios
      .get(`/api/users/status/initialization`)
      .then((res) => {
        if (!res.data.initialized) {
          useRouter().push({ path: "/users/new" });
        }
      })
      .catch(handleError);
    EventBus.on(EventTypes.AUTH_UPDATED, async () => {
      this.isAuthenticated = await AuthService.isAuthenticated();
    });
    this.isAuthenticated = await AuthService.isAuthenticated();
    if (!this.isAuthenticated) {
      useRouter().push({ path: "/users/login" });
    }
  },
  methods: {},
};
</script>

<style scoped>
.navigation_container {
  display: grid;
  align-items: center;
  width: 100%;
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
    grid-auto-columns: 1fr;
    grid-auto-rows: 4em;
    grid-auto-flow: row;
  }
}
</style>
