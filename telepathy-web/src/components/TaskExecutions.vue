<template>
  <div>
    <hr />
    <div class="card-container col-sm-12 col-md-12 col-lg-12">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Executions (task: {{ task.name }})</h5>
          <div class="container">
            <div class="row">
              <div class="col-1">
                <i
                  v-if="taskExecutionHasNewer"
                  v-on:click="selectTaskExecution(taskExecutionPosition - 1)"
                  class="bi bi-arrow-left-circle"
                ></i>
              </div>
              <div class="col">
                <div v-if="currentTaskExecution">
                  <p>
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
                          currentTaskExecution.dateExecuted
                        ).toLocaleString()
                      }})
                    </span>
                    <span v-else-if="currentTaskExecution.dateQueued">
                      ({{
                        new Date(
                          currentTaskExecution.dateExecuted
                        ).toLocaleString()
                      }})
                    </span>
                    {{ currentTaskExecution.status }}
                  </p>
                </div>
              </div>
              <div class="col-1">
                <i
                  v-if="taskExecutionHasOlder"
                  v-on:click="selectTaskExecution(taskExecutionPosition + 1)"
                  class="bi bi-arrow-right-circle"
                ></i>
              </div>
            </div>
          </div>
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
    };
  },
  setup() {},
  created() {
    this.loadTaskExecutionHistory();
    setInterval(() => {
      this.refreshTastExecutionInfo();
    }, 5000);
    EventBus.on(EventTypes.TASK_EXECUTION_TRIGGERED, async (event) => {
      console.log(event);
      if (event.taskId === this.taskId) {
        this.loadTaskExecutionHistory();
      }
    });
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
        .catch((error) => {
          EventBus.emit(EventTypes.ALERT_MESSAGE, {
            type: 'error',
            text: error.message,
          });
        });
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
        .catch((error) => {
          EventBus.emit(EventTypes.ALERT_MESSAGE, {
            type: 'error',
            text: error.message,
          });
        });
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
          .catch((error) => {
            EventBus.emit(EventTypes.ALERT_MESSAGE, {
              type: 'error',
              text: error.message,
            });
          });
        this.getExecutionLogs(this.taskId, this.currentTaskExecution.id);
      }
    },
    selectTaskExecution(position) {
      if (this.taskExecutions.length < position - 1) {
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

<style scoped></style>
