<template>
  <div class="page_content_container">
    <div class="m-0 p-0">
      <div class="row">
        <div class="col-8">
          <h1>Users</h1>
        </div>
        <div class="col-4 text-end">
          <router-link to="/users/new"
            ><i class="bi bi-plus-square icon-button"></i
          ></router-link>
        </div>
      </div>
    </div>
    <div class="task-list row">
      <div
        v-for="user in users"
        v-bind:key="user.id"
        class="col-sm-12 col-md-6 col-lg-4"
      >
        <User :user="user" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Config from '../Config.ts';
import User from '../components/User.vue';
import { AuthService } from '../services/AuthService';
import { handleError } from '../services/EventBus';

export default {
  name: 'Users',
  components: {
    User,
  },
  data() {
    return {
      users: [],
    };
  },
  async created() {
    axios
      .get(
        `${(await Config.get()).SERVER_URL}/users`,
        await AuthService.getAuthHeader()
      )
      .then((res) => {
        this.users = res.data.users;
      })
      .catch(handleError);
  },
};
</script>

<style scoped></style>
