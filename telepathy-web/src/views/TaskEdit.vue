<template>
  <div class="page_content_container">
    <h1 v-if="taskId">Edit Task</h1>
    <h1 v-if="!taskId">New Task</h1>

    <label class="form-label">Name</label>
    <input id="taskName" v-model="task.name" type="text" class="form-control" />

    <label class="form-label">Script</label>
    <div class="form-floating">
      <textarea class="form-control task-script" id="taskScript" style="height: 300px" v-model="task.script"></textarea>
    </div>

    <label class="form-label"
      >Cron Schedule
      <span class="task-schedule">(minute hour day_of_month month day_of_week)</span>
    </label>
    <input id="taskSchedule" v-model="task.schedule" type="text" class="form-control task-schedule" />

    <label class="form-label">Tag</label>
    <select id="taskTag" v-model="task.tag" class="form-select" aria-label="Task Tag Selection">
      <option value="">Any</option>
      <option v-for="tag in tags" v-bind:key="tag" :value="tag">
        {{ tag }}
      </option>
    </select>

    <label class="form-label">Outputs</label>
    <div v-if="task.outputDefinitions.length > 0" class="outputDefinitionsItem">
      <div class="col-6 text-center">Name</div>
      <div class="col-6 text-center">Pattern (RegEx)</div>
    </div>
    <div v-for="(output, index) in task.outputDefinitions" v-bind:key="output.id" class="outputDefinitionsItem">
      <input v-model="output.name" type="text" class="form-control" />
      <input v-model="output.pattern" type="text" class="form-control" />
      <em class="bi bi-trash" v-on:click="deleteOutput(index)"></em>
    </div>
    <div class="outputDefinitionsItem"><em class="bi bi-plus-square" v-on:click="addOutput()"></em></div>

    <label class="form-label">Webhook</label>
    <div class="form-check form-switch">
      <input
        class="form-check-input checkbox"
        type="checkbox"
        v-model="webhookEnabled"
        v-on:click="webhookSwitched()"
        id="flexSwitchCheckDefault"
      />
      <input v-model="task.webhook" type="text" class="form-control" disabled />
      <label class="form-check-label">Webhook call: {API}/tasks/webhooks/{WEBHOOK_ID}</label>
    </div>

    <br />
    <button v-if="taskId" v-on:click="saveUpdate()" id="saveTaskButton" class="btn btn-primary">Save</button>&nbsp;
    <button v-if="taskId" v-on:click="remove()" id="deleteButton" class="btn btn-primary">Delete</button>
    <button v-if="!taskId" v-on:click="saveNew()" id="saveTaskButton" class="btn btn-primary">Save</button>
  </div>
</template>

<script>
import axios from "axios";
import Config from "../Config.ts";
import { EventBus, EventTypes, handleError } from "../services/EventBus";
import { AuthService } from "../services/AuthService";
import router from "../router";

export default {
  name: "TaskEdit",
  props: {
    taskId: String,
  },
  data() {
    return {
      task: { name: "", script: "", outputDefinitions: [] },
      webhookEnabled: false,
      tags: [],
    };
  },
  async created() {
    axios
      .get(`${(await Config.get()).SERVER_URL}/agents/tags`, await AuthService.getAuthHeader())
      .then((res) => {
        this.tags = res.data;
      })
      .catch(handleError);
    if (this.taskId) {
      axios
        .get(`${(await Config.get()).SERVER_URL}/tasks/${this.taskId}`, await AuthService.getAuthHeader())
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
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          let randomString = "";
          for (let i = 0; i < 50; i++) {
            randomString += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          this.task.webhook = randomString;
        } else {
          this.task.webhook = "";
        }
      }, 200);
    },

    async saveUpdate() {
      if (this.task.name && this.task.script) {
        axios
          .put(`${(await Config.get()).SERVER_URL}/tasks/${this.taskId}`, this.task, await AuthService.getAuthHeader())
          .then((res) => {
            EventBus.emit(EventTypes.ALERT_MESSAGE, {
              type: "info",
              text: "Task updated",
            });
          })
          .catch(handleError);
      }
    },

    async saveNew() {
      if (this.task.name && this.task.script) {
        axios
          .post(`${(await Config.get()).SERVER_URL}/tasks`, this.task, await AuthService.getAuthHeader())
          .then((res) => {
            EventBus.emit(EventTypes.ALERT_MESSAGE, {
              type: "info",
              text: "Task created",
            });
            router.push({ path: "/tasks" });
          })
          .catch(handleError);
      }
    },

    async remove() {
      const confirmation = confirm("Delete the task?");
      if (confirmation == true) {
        axios
          .delete(`${(await Config.get()).SERVER_URL}/tasks/${this.taskId}`, await AuthService.getAuthHeader())
          .then((res) => {
            EventBus.emit(EventTypes.ALERT_MESSAGE, {
              type: "info",
              text: "Task Deleted",
            });
            router.push({ path: "/tasks" });
          })
          .catch(handleError);
      }
    },

    addOutput() {
      this.task.outputDefinitions.push({ name: "", pattern: "" });
    },

    deleteOutput(index) {
      this.task.outputDefinitions.splice(index, 1);
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
.task-schedule {
  font-family: monospace;
}
.outputDefinitionsItem {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  padding-left: 1em;
  gap: 1em;
  margin-bottom: 0.5em;
}
</style>
