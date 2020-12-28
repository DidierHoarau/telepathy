<template>
  <div>
    <h1>Tasks</h1>
    <button type="button" class="btn btn-primary">
      <router-link to="/tasks/new">Add</router-link>
    </button>
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
  setup() {
    axios
      .get("http://localhost:8080/tasks")
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
</script>

<style scoped></style>
