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
      <div class="mb-3 task-schedule">
        <label class="form-label"
          >Cron Schedule
          <span>(minute hour day_of_month month day_of_week)</span>
        </label>
        <input v-model="task.schedule" type="text" class="form-control" />
      </div>
      <div class="mb-3">
        <label class="form-label">Tag</label>
        <select
          v-model="task.tag"
          class="form-select"
          aria-label="Task Tag Selection"
        >
          <option value="">Any</option>
          <option v-for="tag in tags" v-bind:key="tag" :value="tag">
            {{ tag }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Outputs</label>
        <div v-if="task.outputDefinitions.length > 0" class="row">
          <div class="col-6 text-center">Name</div>
          <div class="col-6 text-center">Pattern (RegEx)</div>
        </div>
        <div
          v-for="output in task.outputDefinitions"
          v-bind:key="output.id"
          class="row p-0 m-0 mb-1"
        >
          <div class="col-6">
            <input v-model="output.name" type="text" class="form-control" />
          </div>
          <div class="col-6">
            <input v-model="output.pattern" type="text" class="form-control" />
          </div>
        </div>
        <p><i class="bi bi-plus-square" v-on:click="addOutput()"></i></p>
      </div>
      <div class="mb-3">
        <label class="form-label">Webhook</label>
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
import { EventBus, EventTypes, handleError } from '../services/EventBus';
import { AuthService } from '../services/AuthService';
import router from '../router';

export default {
  name: 'TaskEdit',
  props: {
    taskId: String,
  },
  data() {
    return {
      task: { name: '', script: '', outputDefinitions: [] },
      webhookEnabled: false,
      tags: [],
    };
  },
  setup() {},
  async created() {
    axios
      .get(
        `${(await Config.get()).SERVER_URL}/agents/tags`,
        await AuthService.getAuthHeader()
      )
      .then((res) => {
        this.tags = res.data;
      })
      .catch(handleError);
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
        .catch(handleError);
    }
  },
  methods: {
    async webhookSwitched() {
      setTimeout(() => {
        if (this.webhookEnabled) {
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
              text: 'Task updated',
            });
          })
          .catch(handleError);
      }
    },

    async saveNew() {
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
            router.push({ path: '/tasks' });
          })
          .catch(handleError);
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
          .catch(handleError);
      }
    },

    addOutput() {
      this.task.outputDefinitions.push({ name: '', pattern: '' });
    },
  },
};
</script>

<style scoped>
.task-script {
  font-family: monospace;
  white-space: nowrap;
  overflow: auto;
}
.task-schedule span,
.task-schedule input {
  font-family: monospace;
}
</style>
