<template>
  <div class="page_content_container">
    <h1>Login</h1>
    <div class="mb-3">
      <label class="form-label">Name</label>
      <input id="username" v-model="user.name" type="text" class="form-control" />
    </div>
    <div class="mb-3">
      <label class="form-label">Password</label>
      <input id="password" v-model="user.password" type="password" class="form-control" />
    </div>
    <button id="loginButton" v-on:click="login()" class="btn btn-primary">Login</button>
  </div>
</template>

<script>
import axios from "axios";
import Config from "~~/services/Config.ts";
import { AuthService } from "~~/services/AuthService";
import { EventBus, EventTypes, handleError } from "~~/services/EventBus";

export default {
  name: "UserLogin",
  props: {
    msg: String,
  },
  data() {
    return {
      user: { name: "", script: "" },
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
    if (await AuthService.isAuthenticated()) {
      useRouter().push({ path: "/tasks" });
    }
  },
  methods: {
    async login() {
      if (this.user.name && this.user.password) {
        await axios
          .post(`/api/users/session`, this.user)
          .then((res) => {
            AuthService.saveToken(res.data.token);
            EventBus.emit(EventTypes.AUTH_UPDATED, {});
            EventBus.emit(EventTypes.ALERT_MESSAGE, {
              type: "info",
              text: "Authentication successful",
            });
            useRouter().push({ path: "/tasks" });
          })
          .catch(handleError);
      } else {
        EventBus.emit(EventTypes.ALERT_MESSAGE, {
          type: "error",
          text: "Username or password missing",
        });
      }
      this.isAuthenticated = await AuthService.isAuthenticated();
    },
    async logout() {
      await AuthService.removeToken();
      EventBus.emit(EventTypes.AUTH_UPDATED, {});
      EventBus.emit(EventTypes.ALERT_MESSAGE, {
        type: "info",
        text: "Logout successful",
      });
      this.isAuthenticated = await AuthService.isAuthenticated();
    },
  },
};
</script>
