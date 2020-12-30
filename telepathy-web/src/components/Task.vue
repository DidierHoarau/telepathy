<template>
  <div class="card-container col-sm-12 col-md-6 col-lg-4">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">{{ task.name }}</h5>
        <button v-on:click="execute()" class="btn btn-primary">Execute</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Task",
  props: {
    task: Object,
  },
  data() {
    return {};
  },
  setup() {},
  created() {},
  methods: {
    execute() {
      axios
        .post(`http://localhost:8080/tasks/${this.task.id}/executions`, {})
        .then((res) => {
          console.log(res.data);
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script>

<style scoped>
.card {
  margin: 0.6rem 0.2rem 0.6rem 0.2rem;
}
</style>
