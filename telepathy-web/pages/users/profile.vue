<template>
  <div class="page_content_container">
    <button id="loginButton" v-on:click="logout()" class="btn btn-primary">Logout</button>
  </div>
</template>

<script>
import axios from "axios";
import { AuthService } from "~~/services/AuthService";
import { EventBus, EventTypes, handleError } from "~~/services/EventBus";

export default {
  name: "UserLogin",
  props: {
    msg: String,
  },
  data() {
    return {};
  },
  async created() {},
  methods: {
    async logout() {
      await AuthService.removeToken();
      EventBus.emit(EventTypes.AUTH_UPDATED, {});
      EventBus.emit(EventTypes.ALERT_MESSAGE, {
        type: "info",
        text: "Logout successful",
      });
      this.isAuthenticated = await AuthService.isAuthenticated();
      useRouter().push({ path: "/users/login" });
    },
  },
};
</script>
