<template>
  <div class="taskexec_layout">
    <div class="taskexec_layout_title">
      <h2 class="card-title">
        <span class="title-type">Task:</span> {{ task.name }}
      </h2>
    </div>
    <div class="taskexec_layout_close">
      <i v-on:click="closeTaskExecution()" class="bi bi-x icon-button"></i>
    </div>
    <div class="taskexec_layout_exec_newer">
      <i
        v-if="taskExecutionHasNewer"
        v-on:click="selectTaskExecution(taskExecutionPosition - 1)"
        class="bi bi-arrow-left-circle icon-button"
      ></i>
    </div>
    <div class="taskexec_layout_exec_current text-center">
      <div class="execution-header" v-if="currentTaskExecution">
        <h3>
          <span v-if="currentTaskExecution.dateExecuted">
            ({{ new Date(currentTaskExecution.dateExecuted).toLocaleString() }})
          </span>
          <span v-else-if="currentTaskExecution.dateExecuting">
            ({{
              new Date(currentTaskExecution.dateExecuting).toLocaleString()
            }})
          </span>
          <span v-else-if="currentTaskExecution.dateQueued">
            ({{ new Date(currentTaskExecution.dateQueued).toLocaleString() }})
          </span>
          {{ currentTaskExecution.status }}
        </h3>
      </div>
    </div>
    <div class="taskexec_layout_exec_older text-end">
      <i
        v-if="taskExecutionHasOlder"
        v-on:click="selectTaskExecution(taskExecutionPosition + 1)"
        class="bi bi-arrow-right-circle icon-button"
      ></i>
    </div>

    <div class="taskexec_layout_exec_details">
      <div v-if="currentTaskExecution">
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
      <div v-if="currentTaskExecution" class="col-12 p-0 m-0">
        <pre>{{ logs }}</pre>
      </div>
      <div v-else class="col-12 p-0 m-0">
        <p>No execution yet</p>
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
    closeTaskExecution() {
      EventBus.emit(EventTypes.TASK_EXECUTION_CLOSED, { taskId: this.taskId });
    },
  },
};
</script>

<style scoped>
.execution-header {
  margin-top: 0.6rem;
}

.taskexec_layout {
  display: grid;
  grid-template-columns: 2rem 1fr 2rem;
  grid-template-rows: 2.5rem 2.5rem 1fr;
  width: 100%;
  height: auto;
  height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
}

.taskexec_layout_title {
  grid-column: 2;
  grid-row: 1;
}

.taskexec_layout_close {
  grid-column: 3;
  grid-row: 1;
  margin-top: -0.4rem;
}

.taskexec_layout_exec_newer {
  grid-column: 1;
  grid-row: 2;
}

.taskexec_layout_exec_current {
  grid-column: 2;
  grid-row: 2;
}

.taskexec_layout_exec_older {
  grid-column: 3;
  grid-row: 2;
}

.taskexec_layout_exec_details {
  grid-column: 1 / span 3;
  grid-row: 3;
  overflow-x: hidden;
  overflow-y: auto;
  padding-top: 0.5rem;
}

.title-type {
  color: #aaa;
}
</style>
