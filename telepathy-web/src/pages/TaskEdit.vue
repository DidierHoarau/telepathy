<template>
  <div>
    <h1>New Task</h1>
    <div class="mb-12">
      <label class="form-label">Name</label>
      <input v-model="task.name" type="text" class="form-control" />
    </div>
    <div class="mb-12">
      <label class="form-label">Script</label>
      <div class="form-floating">
        <textarea
          class="form-control"
          id="floatingTextarea2"
          style="height: 100px"
          v-model="task.script"
        ></textarea>
      </div>
    </div>
    <button v-on:click="save()" class="btn btn-primary">Save</button>
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
      task: { name: "", script: "" },
    };
  },
  setup() {},
  methods: {
    save() {
      if (this.task.name && this.task.script) {
        axios
          .post("http://localhost:8080/tasks", this.task)
          .then((res) => {
            console.log(res.data);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
  },
};
</script>

<style scoped></style>
