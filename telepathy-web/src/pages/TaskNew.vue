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
          style="height: 300px"
          v-model="task.script"
        ></textarea>
      </div>
    </div>
    <button v-on:click="save()" class="btn btn-primary">Save</button>
  </div>
</template>

<script>
import axios from 'axios';
import Config from '../Config.ts';
import { EventBus, EventTypes } from '../services/EventBus';
import { AuthService } from '../services/AuthService';

export default {
  name: 'TaskEdit',
  props: {
    msg: String,
  },
  data() {
    return {
      task: { name: '', script: '' },
    };
  },
  setup() {},
  methods: {
    async save() {
      if (this.task.name && this.task.script) {
        axios
          .post(
            `${(await Config.get()).SERVER_URL}/tasks`,
            this.task,
            await AuthService.getAuthHeader()
          )
          .then((res) => {
            EventBus.emit(EventTypes.ALERT_MESSAGE, {
              type: 'info',
              text: 'Task created',
            });
          })
          .catch((error) => {
            EventBus.emit(EventTypes.ALERT_MESSAGE, {
              type: 'error',
              text: error,
            });
          });
      }
    },
  },
};
</script>

<style scoped></style>
