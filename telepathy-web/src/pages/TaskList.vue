<template>
  <div class="container">
    <h1>Tasks</h1>
    <div class="task-list row">
      <Task v-for="task in tasks" v-bind:key="task.id" :task="task" />
    </div>
    <button type="button" class="btn btn-primary">
      <router-link to="/tasks/new">Add</router-link>
    </button>
  </div>
</template>

<script>
import axios from "axios";
import Task from "../components/Task.vue";

export default {
  name: "Tasks",
  components: {
    Task,
  },
  data() {
    return {
      tasks: [],
    };
  },
  created() {
    this.load();
  },
  methods: {
    load() {
      axios
        .get("http://localhost:8080/tasks")
        .then((res) => {
          this.tasks = res.data.tasks;
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script>

<style scoped>
.task-list {
  width: 100%;
}
</style>
