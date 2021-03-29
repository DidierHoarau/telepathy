<template>
  <div class="container">
    <h1>Tasks</h1>
    <div class="task-list row">
      <Task
        v-on:click="onTaskClicked(task.id)"
        v-for="task in tasks"
        v-bind:key="task.id"
        :task="task"
      />
    </div>
    <button type="button" class="btn btn-primary">
      <router-link to="/tasks/new">Add</router-link>
    </button>
    <TaskExecution v-if="taskExecution" :taskExecution="taskExecution" />
  </div>
</template>

<script>
import axios from 'axios';
import Task from '../components/Task.vue';
import TaskExecution from '../components/TaskExecution.vue';
import Config from '../Config.ts';
import { EventBus, EventTypes } from '../services/EventBus';
import { AuthService } from '../services/AuthService';

export default {
  name: 'Tasks',
  components: {
    Task,
    TaskExecution,
  },
  data() {
    return {
      tasks: [],
      displayTaskExecution: false,
      taskExecution: null,
    };
  },
  created() {
    this.load();
    EventBus.on(EventTypes.TASK_UPDATED, (event) => {
      console.log(event);
    });
  },
  methods: {
    async load() {
      axios
        .get(
          `${(await Config.get()).SERVER_URL}/tasks`,
          await AuthService.getAuthHeader()
        )
        .then((res) => {
          this.tasks = res.data.tasks;
        })
        .catch((error) => {
          EventBus.emit(EventTypes.ALERT_MESSAGE, {
            type: 'error',
            text: error.message,
          });
        });
    },
    async onTaskClicked(id) {
      axios
        .get(
          `${(await Config.get()).SERVER_URL}/tasks/${id}/executions`,
          await AuthService.getAuthHeader()
        )
        .then((res) => {
          this.taskExecution = res.data.task_executions[0];
          this.displaytaskExecution = true;
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
.task-list {
  width: 100%;
}
</style>
