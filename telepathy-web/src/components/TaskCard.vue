<template>
  <div class="cardLayout">
    <div class="cardlayout_content">
      <h2 id="taskName">{{ task.name }}</h2>
      <div v-if="lastExecution">
        <p>
          {{ lastExecution.status }}
          <span v-if="lastExecution.dateExecuted">{{ new Date(lastExecution.dateExecuted).toLocaleString() }}</span>
        </p>
        <div v-for="output in lastExecution.outputs" v-bind:key="output.id" class="taskoutput">
          <div class="taskoutput_name">{{ output.name }}:</div>
          <div class="taskoutput_value">
            {{ output.value }}
          </div>
        </div>
      </div>
    </div>
    <div class="cardlayout_actions">
      <p class="text-end">
        <em v-on:click="edit()" id="editButton" class="bi bi-pencil-square icon-button"></em>
        <br /><br />
        <em v-on:click="execute()" class="bi bi-play-circle icon-button"></em>
      </p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Config from "../Config.ts";
import { EventBus, EventTypes, handleError } from "../services/EventBus";
import { AuthService } from "../services/AuthService";
import router from "../router";

export default {
  name: "TaskCard",
  props: {
    task: Object,
  },
  data() {
    return {
      lastExecution: null,
      updateLoop: null,
    };
  },
  created() {
    this.updateLoop = setInterval(() => {
      this.checkExecutions();
    }, 10 * 1000);
    this.checkExecutions();
  },
  unmounted() {
    if (this.updateLoop) {
      clearInterval(this.updateLoop);
    }
  },
  methods: {
    edit() {
      router.push({ path: `/tasks/${this.task.id}/edit` });
    },
    async execute() {
      axios
        .post(
          `${(await Config.get()).SERVER_URL}/tasks/${this.task.id}/executions`,
          {},
          await AuthService.getAuthHeader()
        )
        .then((res) => {
          EventBus.emit(EventTypes.TASK_UPDATED, { taskId: this.task.id });
          EventBus.emit(EventTypes.TASK_EXECUTION_TRIGGERED, {
            taskId: this.task.id,
          });
        })
        .catch(handleError);
    },
    async checkExecutions() {
      axios
        .get(`${(await Config.get()).SERVER_URL}/tasks/${this.task.id}/executions`, await AuthService.getAuthHeader())
        .then((res) => {
          if (res.data.task_executions.length > 0) {
            this.lastExecution = res.data.task_executions[0];
          } else {
            this.lastExecution = null;
          }
        })
        .catch(handleError);
    },
  },
};
</script>

<style scoped></style>
