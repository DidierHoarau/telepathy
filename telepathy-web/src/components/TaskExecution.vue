<template>
  <div>
    <hr />
    <div class="card-container col-sm-12 col-md-12 col-lg-12">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Execution (task: {{ task.name }})</h5>
          <p>
            {{ taskExecutionInfo.status }}
            <span v-if="taskExecutionInfo.dateExecuted"
              >({{
                new Date(taskExecutionInfo.dateExecuted).toLocaleString()
              }})</span
            >
          </p>
          <pre>{{ logs }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Config from '../Config.ts';
import { AuthService } from '../services/AuthService';
import { EventBus, EventTypes } from '../services/EventBus';

export default {
  name: 'TaskExecution',
  props: {
    taskExecution: Object,
  },
  watch: {
    async taskExecution(newValue) {
      this.getTaskInfo(newValue.taskId);
      this.getTaskExecutionInfo(newValue.taskId, newValue.id);
      this.getTaskLogs(newValue.taskId, newValue.id);
    },
  },
  data() {
    return {
      task: {},
      taskExecutionInfo: {},
      logs: '',
    };
  },
  setup() {},
  created() {
    setInterval(() => {
      this.getTaskInfo(this.taskExecution.taskId);
      this.getTaskExecutionInfo(
        this.taskExecution.taskId,
        this.taskExecution.id
      );
      this.getTaskLogs(this.taskExecution.taskId, this.taskExecution.id);
    }, 5 * 1000);
    this.getTaskInfo(this.taskExecution.taskId);
    this.getTaskExecutionInfo(this.taskExecution.taskId, this.taskExecution.id);
    this.getTaskLogs(this.taskExecution.taskId, this.taskExecution.id);
  },
  methods: {
    async getTaskInfo(taskId) {
      axios
        .get(
          `${(await Config.get()).SERVER_URL}/tasks/${taskId}`,
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
    async getTaskLogs(taskId, executionId) {
      axios
        .get(
          `${
            (await Config.get()).SERVER_URL
          }/tasks/${taskId}/executions/${executionId}/logs`,
          await AuthService.getAuthHeader()
        )
        .then((res) => {
          this.logs = res.data.logs;
        })
        .catch((error) => {
          EventBus.emit(EventTypes.ALERT_MESSAGE, {
            type: 'error',
            text: error.message,
          });
        });
    },
    async getTaskExecutionInfo(taskId, executionId) {
      axios
        .get(
          `${
            (await Config.get()).SERVER_URL
          }/tasks/${taskId}/executions/${executionId}`,
          await AuthService.getAuthHeader()
        )
        .then((res) => {
          this.taskExecutionInfo = res.data;
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
