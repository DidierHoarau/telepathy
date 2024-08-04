<template>
  <div class="page_content_container">
    <h2>New User</h2>

    <label class="form-label">Name</label>
    <input v-model="user.name" type="text" class="form-control" />

    <div v-if="userId" class="form-check form-switch formSection">
      <input
        class="form-check-input checkbox"
        type="checkbox"
        v-model="passwordEnabled"
        v-on:click="passwordSwitch()"
        id="flexSwitchCheckDefault"
      />
      <label class="form-label">Password</label>
    </div>
    <label v-if="!userId" class="form-label">Password</label>
    <input v-model="user.password" type="password" class="form-control" :disabled="!passwordEnabled" />

    <button v-if="!userId" v-on:click="saveNew()" class="btn btn-primary">Create</button>
  </div>
</template>

<script>
import axios from "axios";
import Config from "~~/services/Config.ts";
import { AuthService } from "~/services/AuthService";
import { handleError, EventBus, EventTypes } from "~/services/EventBus";

export default {
  name: "UserEdit",
  props: {
    userId: String,
  },
  data() {
    return {
      user: {},
    };
  },
  async created() {
    if (this.userId) {
      this.passwordEnabled = false;
      axios
        .get(`${(await Config.get()).SERVER_URL}/users/${this.userId}`, await AuthService.getAuthHeader())
        .then((res) => {
          this.user = res.data;
        })
        .catch(handleError);
    } else {
      this.passwordEnabled = true;
    }
  },
  methods: {
    async saveNew() {
      if (this.user.name && this.user.password) {
        await axios
          .post(`${(await Config.get()).SERVER_URL}/users`, this.user, await AuthService.getAuthHeader())
          .then((res) => {
            EventBus.emit(EventTypes.ALERT_MESSAGE, {
              type: "info",
              text: "User created",
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
    },
  },
};
</script>
