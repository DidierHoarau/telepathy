<template>
  <div class="pageContent">
    <div class="pageHeader">
      <h1>Users</h1>
      <router-link to="/users/new"><em class="bi bi-plus-square icon-button"></em></router-link>
    </div>
    <div class="cardList">
      <div v-for="user in users" v-bind:key="user.id">
        <UserCard :user="user" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Config from "../Config.ts";
import UserCard from "../components/UserCard.vue";
import { AuthService } from "../services/AuthService";
import { handleError } from "../services/EventBus";

export default {
  name: "UserList",
  components: {
    UserCard,
  },
  data() {
    return {
      users: [],
    };
  },
  async created() {
    axios
      .get(`${(await Config.get()).SERVER_URL}/users`, await AuthService.getAuthHeader())
      .then((res) => {
        this.users = res.data.users;
      })
      .catch(handleError);
  },
};
</script>

<style scoped></style>
