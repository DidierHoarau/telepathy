<template>
  <div>
    <h1 v-if="taskId">Edit Task</h1>
    <h1 v-if="!taskId">New Task</h1>
    <div>
      <div class="mb-3">
        <label class="form-label">Name</label>
        <input v-model="task.name" type="text" class="form-control" />
      </div>
      <div class="mb-3">
        <label class="form-label">Script</label>
        <div class="form-floating">
          <textarea
            class="form-control task-script"
            id="floatingTextarea2"
            style="height: 300px"
            v-model="task.script"
          ></textarea>
        </div>
      </div>
      <div class="mb-3">
        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            v-model="webhookEnabled"
            v-on:click="webhookSwitched()"
            id="flexSwitchCheckDefault"
          />
          <input
            v-model="task.webhook"
            type="text"
            class="form-control"
            disabled
          />
          <label class="form-check-label"
            >Webhook call: {API}/tasks/webhooks/{WEBHOOK_ID}</label
          >
        </div>
      </div>
      <br />
      <button v-if="taskId" v-on:click="saveUpdate()" class="btn btn-primary">
        Save</button
      >&nbsp;
      <button v-if="taskId" v-on:click="remove()" class="btn btn-primary">
        Delete
      </button>
      <button v-if="!taskId" v-on:click="saveNew()" class="btn btn-primary">
        Save
      </button>
    </div>
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
      webhookEnabled: false,
    };
  },
  setup() {},
  async created() {
    if (this.taskId) {
      axios
        .get(
          `${(await Config.get()).SERVER_URL}/tasks/${this.taskId}`,
          await AuthService.getAuthHeader()
        )
        .then((res) => {
          this.task = res.data;
          if (this.task.webhook) {
            this.webhookEnabled = true;
          } else {
            this.webhookEnabled = false;
          }
        })
        .catch((error) => {
          EventBus.emit(EventTypes.ALERT_MESSAGE, {
            type: 'error',
            text: error.message,
          });
        });
    }
  },
  methods: {
    async webhookSwitched() {
      setTimeout(() => {
        if (this.webhookEnabled) {
          console.log('foo');
          const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let randomString = '';
          for (let i = 0; i < 50; i++) {
            randomString += chars.charAt(
              Math.floor(Math.random() * chars.length)
            );
          }
          this.task.webhook = randomString;
        } else {
          this.task.webhook = '';
        }
      }, 200);
    },

    async saveUpdate() {
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

    async saveNew() {
      if (this.task.name && this.task.script) {
        console.log(this.task);
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
            router.push({ path: '/tasks' });
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

<style scoped>
.task-script {
  font-family: monospace;
}
</style>
