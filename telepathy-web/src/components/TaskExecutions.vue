<template>
  <div>
    <hr />
    <div class="card">
      <div class="card-body p-4">
        <h5 class="card-title">Executions (task: {{ task.name }})</h5>
        <div class="row p-0 m-0">
          <div class="col-1 p-0 m-0">
            <i
              v-if="taskExecutionHasNewer"
              v-on:click="selectTaskExecution(taskExecutionPosition - 1)"
              class="bi bi-arrow-left-circle icon-button"
            ></i>
          </div>
          <div class="col p-0 m-0 text-center">
            <div class="execution-header" v-if="currentTaskExecution">
              <h6>
                <span v-if="currentTaskExecution.dateExecuted">
                  ({{
                    new Date(
                      currentTaskExecution.dateExecuted
                    ).toLocaleString()
                  }})
                </span>
                <span v-else-if="currentTaskExecution.dateExecuting">
                  ({{
                    new Date(
                      currentTaskExecution.dateExecuting
                    ).toLocaleString()
                  }})
                </span>
                <span v-else-if="currentTaskExecution.dateQueued">
                  ({{
                    new Date(currentTaskExecution.dateQueued).toLocaleString()
                  }})
                </span>
                {{ currentTaskExecution.status }}
              </h6>
            </div>
          </div>
          <div class="col-1 p-0 m-0 text-end">
            <i
              v-if="taskExecutionHasOlder"
              v-on:click="selectTaskExecution(taskExecutionPosition + 1)"
              class="bi bi-arrow-right-circle icon-button"
            ></i>
          </div>

          <div v-if="currentTaskExecution" class="col-12 p-0 m-0 mt-3 mb-1">
            <div
              v-for="output in currentTaskExecution.outputs"
              v-bind:key="output.id"
              class="row mt-2 task-output"
            >
              <div class="col-6">{{ output.name }}:</div>
              <div class="col-6">
                {{ output.value }}
              </div>
            </div>
          </div>
          <div class="col-12 p-0 m-0">
            <br />
            <pre>{{ logs }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Config from '../Config.ts';
import { AuthService } from '../services/AuthService';
import { EventBus, EventTypes, handleError } from '../services/EventBus';

export default {
  name: 'TaskExecutions',
  props: {
    taskId: String,
  },
  watch: {
    async taskId(newValue) {
      this.loadTaskExecutionHistory();
    },
  },
  data() {
    return {
      task: {},
      taskExecutions: [],
      taskExecutionPosition: 0,
      currentTaskExecution: null,
      taskExecutionHasOlder: false,
      taskExecutionHasNewer: false,
      logs: '',
      updateLoop: null,
    };
  },
  setup() {},
  created() {
    this.loadTaskExecutionHistory();
    this.updateLoop = setInterval(() => {
      this.refreshTastExecutionInfo();
    }, 5000);
    EventBus.on(EventTypes.TASK_EXECUTION_TRIGGERED, async (event) => {
      if (event.taskId === this.taskId) {
        this.loadTaskExecutionHistory();
      }
    });
  },
  unmounted() {
    if (this.updateLoop) {
      clearInterval(this.updateLoop);
    }
  },
  methods: {
    async loadTaskExecutionHistory() {
      axios
        .get(
          `${(await Config.get()).SERVER_URL}/tasks/${this.taskId}`,
          await AuthService.getAuthHeader()
        )
        .then((res) => {
          this.task = res.data;
        })
        .catch(handleError);
      axios
        .get(
          `${(await Config.get()).SERVER_URL}/tasks/${this.taskId}/executions`,
          await AuthService.getAuthHeader()
        )
        .then((res) => {
          this.taskExecutionPosition = 0;
          this.taskExecutions = res.data.task_executions;
          this.selectTaskExecution(0);
        })
        .catch(handleError);
    },
    async refreshTastExecutionInfo() {
      if (this.currentTaskExecution) {
        axios
          .get(
            `${(await Config.get()).SERVER_URL}/tasks/${
              this.taskId
            }/executions/${this.currentTaskExecution.id}`,
            await AuthService.getAuthHeader()
          )
          .then((res) => {
            this.currentTaskExecution = res.data;
          })
          .catch(handleError);
        this.getExecutionLogs(this.taskId, this.currentTaskExecution.id);
      }
    },
    selectTaskExecution(position) {
      if (this.taskExecutions.length === 0) {
        this.currentTaskExecution = null;
        this.taskExecutionHasOlder = false;
        this.taskExecutionHasNewer = false;
      } else {
        if (position === 0) {
          this.taskExecutionHasNewer = false;
        } else {
          this.taskExecutionHasNewer = true;
        }
        if (position === this.taskExecutions.length - 1) {
          this.taskExecutionHasOlder = false;
        } else {
          this.taskExecutionHasOlder = true;
        }
        this.taskExecutionPosition = position;
        this.currentTaskExecution = this.taskExecutions[position];
        this.getExecutionLogs(this.taskId, this.currentTaskExecution.id);
      }
    },
    async getExecutionLogs(taskId, executionId) {
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
        .catch(handleError);
    },
  },
};
</script>

<style scoped>
.execution-header {
  margin-top: 0.6rem;
}
</style>
