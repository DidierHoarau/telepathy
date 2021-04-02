<template>
  <div>
    <div v-if="!isAuthenticated">
      <h1>Login</h1>
      <div class="mb-3">
        <label class="form-label">Name</label>
        <input v-model="user.name" type="text" class="form-control" />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="user.password" type="password" class="form-control" />
      </div>
      <button v-on:click="login()" class="btn btn-primary">Login</button>
    </div>
    <div v-if="isAuthenticated">
      <h1>Logged in</h1>
      <button
        v-if="isAuthenticated"
        v-on:click="logout()"
        class="btn btn-primary"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Config from '../Config.ts';
import { AuthService } from '../services/AuthService';
import { EventBus, EventTypes, handleError } from '../services/EventBus';
import router from '../router';

export default {
  name: 'UserLogin',
  props: {
    msg: String,
  },
  data() {
    return {
      user: { name: '', script: '' },
      isAuthenticated: false,
    };
  },
  async created() {
    await axios
      .get(`${(await Config.get()).SERVER_URL}/users/initialization`)
      .then((res) => {
        if (!res.data.initialized) {
          router.push({ path: '/users/new' });
        }
      })
      .catch(handleError);
    this.isAuthenticated = await AuthService.isAuthenticated();
  },
  setup() {},
  methods: {
    async login() {
      if (this.user.name && this.user.password) {
        await axios
          .post(`${(await Config.get()).SERVER_URL}/users/session`, this.user)
          .then((res) => {
            AuthService.saveToken(res.data.token);
            EventBus.emit(EventTypes.AUTH_UPDATED, {});
            EventBus.emit(EventTypes.ALERT_MESSAGE, {
              type: 'info',
              text: 'Authentication successful',
            });
          })
          .catch(handleError);
      } else {
        EventBus.emit(EventTypes.ALERT_MESSAGE, {
          type: 'error',
          text: 'Username or password missing',
        });
      }
      this.isAuthenticated = await AuthService.isAuthenticated();
    },
    async logout() {
      await AuthService.removeToken();
      EventBus.emit(EventTypes.AUTH_UPDATED, {});
      EventBus.emit(EventTypes.ALERT_MESSAGE, {
        type: 'info',
        text: 'Logout successful',
      });
      this.isAuthenticated = await AuthService.isAuthenticated();
    },
  },
};
</script>

<style scoped></style>
