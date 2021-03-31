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
    <br />
    <TaskExecutions v-if="taskIdSelected" :taskId="taskIdSelected" />
  </div>
</template>

<script>
import axios from 'axios';
import Task from '../components/Task.vue';
import TaskExecutions from '../components/TaskExecutions.vue';
import Config from '../Config.ts';
import { EventBus, EventTypes } from '../services/EventBus';
import { AuthService } from '../services/AuthService';

export default {
  name: 'Tasks',
  components: {
    Task,
    TaskExecutions,
  },
  data() {
    return {
      tasks: [],
      taskIdSelected: null,
    };
  },
  created() {
    this.load();
    EventBus.on(EventTypes.TASK_UPDATED, (event) => {
      this.load();
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
      this.taskIdSelected = id;
    },
  },
};
</script>

<style scoped>
.task-list {
  width: 100%;
}
</style>
