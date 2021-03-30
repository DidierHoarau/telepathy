<template>
  <div>
    <h1>Edit Task</h1>
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
    <button v-on:click="save()" class="btn btn-primary">Save</button>&nbsp;
    <button v-on:click="remove()" class="btn btn-primary">Delete</button>
  </div>
</template>

<script>
import axios from 'axios';
import Config from '../Config.ts';
import { EventBus, EventTypes } from '../services/EventBus';
import { AuthService } from '../services/AuthService';
import router from '../router';

export default {
  name: 'TaskEdit',
  props: {
    taskId: String,
  },
  data() {
    return {
      task: { name: '', script: '' },
    };
  },
  setup() {},
  async created() {
    axios
      .get(
        `${(await Config.get()).SERVER_URL}/tasks/${this.taskId}`,
        await AuthService.getAuthHeader()
      )
      .then((res) => {
        this.task = res.data;
      })
      .catch((error) => {
        EventBus.emit(EventTypes.ALERT_MESSAGE, {
          type: 'error',
          text: error.message,
        });
      });
  },
  methods: {
    async save() {
      if (this.task.name && this.task.script) {
        axios
          .put(
            `${(await Config.get()).SERVER_URL}/tasks/${this.taskId}`,
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
    async remove() {
      const confirmation = confirm('Delete the task?');
      if (confirmation == true) {
        axios
          .delete(
            `${(await Config.get()).SERVER_URL}/tasks/${this.taskId}`,
            await AuthService.getAuthHeader()
          )
          .then((res) => {
            EventBus.emit(EventTypes.ALERT_MESSAGE, {
              type: 'info',
              text: 'Task Deleted',
            });
            router.push({ path: '/tasks' });
          })
          .catch((error) => {
            EventBus.emit(EventTypes.ALERT_MESSAGE, {
              type: 'error',
              text: error.message,
            });
          });
      }
    },
  },
};
</script>

<style scoped></style>
