<template>
  <nav id="sidebarMenu" class="col-sm-12 col-md-3 col-lg-2 bg-light">
    <div v-if="isAuthenticated" class="position-sticky pt-3">
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link to="/tasks">Tasks</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/agents">Agents</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/users">Users</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/users/login">Logout</router-link>
        </li>
      </ul>
    </div>
    <div v-if="!isAuthenticated" class="position-sticky pt-3">
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link to="/users/login">Login</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { EventBus, EventTypes } from '../services/EventBus';
import { AuthService } from '../services/AuthService';
import router from '../router';

export default {
  name: 'Navigation',
  data() {
    return {
      isAuthenticated: false,
    };
  },
  async created() {
    EventBus.on(EventTypes.AUTH_UPDATED, async (event) => {
      this.isAuthenticated = await AuthService.isAuthenticated();
    });
    this.isAuthenticated = await AuthService.isAuthenticated();
    if (!this.isAuthenticated) {
      router.push({ path: '/users/login' });
    }
  },
  methods: {},
};
</script>

<style scoped></style>
