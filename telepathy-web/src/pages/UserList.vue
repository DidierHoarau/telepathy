<template>
  <div>
    <h1>Users</h1>
  </div>
</template>

<script>
import axios from "axios";

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
