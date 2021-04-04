<template>
  <div class="card-container col-sm-12 col-md-6 col-lg-4">
    <div class="card text-dark bg-light mb-3">
      <div class="row m-0 p-4">
        <div class="col-11 m-0 p-0">
          <h5 class="card-title">{{ task.name }}</h5>
          <div v-if="lastExecution">
            <p>
              {{ lastExecution.status }}
              <span v-if="lastExecution.dateExecuted">{{
                new Date(lastExecution.dateExecuted).toLocaleString()
              }}</span>
            </p>
            <div
              v-for="output in lastExecution.outputs"
              v-bind:key="output.id"
              class="row mt-2 task-output"
            >
              <div class="col-6">{{ output.name }}:</div>
              <div class="col-6">
                {{ output.value }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-1 m-0 p-0">
          <p class="text-end">
            <i v-on:click="edit()" class="bi bi-pencil-square icon-button"></i>
            <br /><br />
            <i v-on:click="execute()" class="bi bi-play-circle icon-button"></i>
          </p>
        </div>
      </div>
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
  name: 'Task',
  props: {
    task: Object,
  },
  data() {
    return {
      lastExecution: null,
      updateLoop: null,
    };
  },
  setup() {},
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
        .get(
          `${(await Config.get()).SERVER_URL}/tasks/${this.task.id}/executions`,
          await AuthService.getAuthHeader()
        )
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

<style scoped>
.card {
  margin: 0.6rem 0.2rem 0.6rem 0.2rem;
}
</style>
