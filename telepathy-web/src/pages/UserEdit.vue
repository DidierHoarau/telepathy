<template>
  <div>
    <h1>New User</h1>
    <div class="mb-3">
      <label class="form-label">Name</label>
      <input v-model="user.name" type="text" class="form-control" />
    </div>
    <div class="mb-3">
      <label class="form-label">Password</label>
      <input v-model="user.password" type="password" class="form-control" />
    </div>
    <button v-on:click="save()" class="btn btn-primary">Save</button>
  </div>
</template>

<script>
import axios from 'axios';
import Config from '../Config.ts';
import { AuthService } from '../services/AuthService';

export default {
  name: 'UserEdit',
  props: {
    msg: String,
  },
  data() {
    return {
      user: { name: '', script: '' },
    };
  },
  setup() {},
  methods: {
    async save() {
      if (this.user.name && this.user.password) {
        axios
          .post(
            `${(await Config.get()).SERVER_URL}/users`,
            this.user,
            await AuthService.getAuthHeader()
          )
          .then((res) => {})
          .catch((error) => {
            EventBus.emit(EventTypes.ALERT_MESSAGE, {
              type: 'error',
              text: error.message,
            });
          });
      }
    },
  },
};
</script>

<style scoped></style>
