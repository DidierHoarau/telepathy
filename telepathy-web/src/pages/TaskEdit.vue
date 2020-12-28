<template>
  <form>
    <h1>New Task</h1>
    <div class="mb-12">
      <label class="form-label">Name</label>
      <input type="text" class="form-control" />
    </div>
    <div class="mb-12">
      <label class="form-label">Script</label>
      <div class="form-floating">
        <textarea
          class="form-control"
          id="floatingTextarea2"
          style="height: 100px"
        ></textarea>
      </div>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
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
