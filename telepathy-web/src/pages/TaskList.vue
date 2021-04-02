<template>
  <div class="page-content">
    <div class="m-0 p-0">
      <div class="row">
        <div class="col-11">
          <h1>Tasks</h1>
        </div>
        <div class="col-1 p-3 text-end">
          <router-link to="/tasks/new"
            ><i class="bi bi-plus-square icon-button"></i
          ></router-link>
        </div>
      </div>
    </div>
    <div class="task-list row">
      <Task
        v-on:click="onTaskClicked(task.id)"
        v-for="task in tasks"
        v-bind:key="task.id"
        :task="task"
      />
    </div>

    <br />
    <TaskExecutions v-if="taskIdSelected" :taskId="taskIdSelected" />
  </div>
</template>

<script>
import axios from 'axios';
import Task from '../components/Task.vue';
import TaskExecutions from '../components/TaskExecutions.vue';
import Config from '../Config.ts';
import { EventBus, EventTypes, handleError } from '../services/EventBus';
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
        .catch(handleError);
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
