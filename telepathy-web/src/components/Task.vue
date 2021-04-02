<template>
  <div class="card-container col-sm-12 col-md-6 col-lg-4">
    <div class="card text-dark bg-light mb-3">
      <div class="row m-0 p-4">
        <div class="col-11 m-0 p-0">
          <h5 class="card-title">{{ task.name }}</h5>
          <p v-if="taskExecutions.length > 0">
            {{ taskExecutions[0].status }}
            <span v-if="taskExecutions[0].dateExecuted">{{
              new Date(taskExecutions[0].dateExecuted).toLocaleString()
            }}</span>
          </p>
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
      taskExecutions: [],
    };
  },
  setup() {},
  created() {
    setInterval(() => {
      this.checkExecutions();
    }, 10 * 1000);
    this.checkExecutions();
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
          this.taskExecutions = res.data.task_executions;
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
