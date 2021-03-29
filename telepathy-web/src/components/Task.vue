<template>
  <div class="card-container col-sm-12 col-md-6 col-lg-4">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">{{ task.name }}</h5>
        <p v-if="taskExecutions.length > 0">
          {{ taskExecutions[0].status }}
          {{ taskExecutions[0].dateExecuted }}
        </p>
        <button v-on:click="execute()" class="btn btn-primary">Execute</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Config from '../Config.ts';
import { EventBus, EventTypes } from '../services/EventBus';
import { AuthService } from '../services/AuthService';

export default {
  name: 'Task',
  props: {
    task: Object,
  },
  data() {
    return {
      taskExecutions: [],
    };
  },
  setup() {},
  created() {
    this.checkExecutions();
  },
  methods: {
    async execute() {
      axios
        .post(
          `${(await Config.get()).SERVER_URL}/tasks/${this.task.id}/executions`,
          {},
          await AuthService.getAuthHeader()
        )
        .then((res) => {
          EventBus.emit(EventTypes.TASK_UPDATED, { taskId: this.task.id });
        })
        .catch((error) => {
          EventBus.emit(EventTypes.ALERT_MESSAGE, {
            type: 'error',
            text: error.message,
          });
        });
    },
    async checkExecutions() {
      axios
        .get(
          `${(await Config.get()).SERVER_URL}/tasks/${this.task.id}/executions`,
          await AuthService.getAuthHeader()
        )
        .then((res) => {
          this.taskExecutions = res.data.task_executions;
        })
        .catch((error) => {
          EventBus.emit(EventTypes.ALERT_MESSAGE, {
            type: 'error',
            text: error.message,
          });
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
