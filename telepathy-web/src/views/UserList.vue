<template>
  <div>
    <h1>Users</h1>
    <button type="button" class="btn btn-primary">
      <router-link to="/users/new">Add</router-link>
    </button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

import axios from "axios";
import Config from "../Config.ts";

export default {
  name: "Tasks",
  props: {
    msg: String,
  },
  data() {
    return {
      count: 0,
    };
  },
  setup() {},
};
</script>

<style scoped></style>
