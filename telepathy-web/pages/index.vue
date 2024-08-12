<template>
  <div class="pageContent">
    <div class="page_header">
      <h2>Users</h2>
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
import UserCard from "~~/components/UserCard.vue";
import { AuthService } from "~~/services/AuthService";
import { handleError } from "~~/services/EventBus";

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
    if (await AuthService.isAuthenticated()) {
      useRouter().push({ path: "/tasks" });
    } else {
      useRouter().push({ path: "/users/login" });
    }
  },
};
</script>
