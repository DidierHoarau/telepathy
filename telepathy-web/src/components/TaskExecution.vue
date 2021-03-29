<template>
  <div>
    <hr />
    <div class="card-container col-sm-12 col-md-12 col-lg-12">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Execution (task: {{ task.name }})</h5>
          <p>
            {{ taskExecution.status }}
            <span v-if="taskExecution.dateExecuted"
              >({{ taskExecution.dateExecuted }})</span
            >
          </p>
          <pre>{{ taskExecution.outputRaw }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Config from '../Config.ts';

export default {
  name: 'TaskExecution',
  props: {
    taskExecution: Object,
  },
  watch: {
    async taskExecution(newValue) {
      this.getTaskInfo(newValue.taskId);
    },
  },
  data() {
    return {
      task: {},
    };
  },
  setup() {},
  created() {
    this.getTaskInfo(this.taskExecution.taskId);
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
          console.error(error);
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
