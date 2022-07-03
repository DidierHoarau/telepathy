<template>
  <div class="task_page_container">
    <div class="task_page_list page_content_container" v-bind:style="{ gridRow: listGridPosition }">
      <div class="m-0 p-0">
        <div class="row">
          <div class="col-8">
            <h1>Tasks</h1>
          </div>
          <div class="col-4 text-end">
            <router-link to="/tasks/new"><em class="bi bi-plus-square icon-button"></em></router-link>
          </div>
        </div>
      </div>
      <div class="task-list">
        <div v-for="folder in taskFolders" v-bind:key="folder.name">
          <div class="row">
            <div v-if="folder.name">
              <hr />
              <h3>{{ folder.name }}</h3>
            </div>
            <div v-for="task in folder.tasks" v-bind:key="task.id" class="col-sm-12 col-md-6 col-lg-4">
              <Task v-on:click="onTaskClicked(task.id)" :task="task" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="taskIdSelected" class="task_page_detail page_content_container">
      <TaskExecutions :taskId="taskIdSelected" />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as _ from "lodash";
import Task from "../components/Task.vue";
import TaskExecutions from "../components/TaskExecutions.vue";
import Config from "../Config.ts";
import { EventBus, EventTypes, handleError } from "../services/EventBus";
import { AuthService } from "../services/AuthService";

export default {
  name: "Tasks",
  components: {
    Task,
    TaskExecutions,
  },
  data() {
    return {
      taskFolders: [],
      taskIdSelected: null,
      listGridPosition: "1 / span 2",
    };
  },
  created() {
    this.load();
    EventBus.on(EventTypes.TASK_UPDATED, (event) => {
      this.load();
    });
    EventBus.on(EventTypes.TASK_EXECUTION_CLOSED, (event) => {
      this.listGridPosition = "1 / span 2";
      this.taskIdSelected = null;
    });
  },
  methods: {
    async load() {
      axios
        .get(`${(await Config.get()).SERVER_URL}/tasks`, await AuthService.getAuthHeader())
        .then((res) => {
          const folders = [];
          const sortedTasks = _.sortBy(res.data.tasks, "name");
          for (let i = 0; i < sortedTasks.length; i++) {
            let folderName = "";
            if (sortedTasks[i].name.indexOf("/") > 0) {
              folderName = sortedTasks[i].name.substring(0, sortedTasks[i].name.indexOf("/"));
            }
            let folder = _.find(folders, { name: folderName });
            if (!folder) {
              folder = { name: folderName, tasks: [] };
              folders.push(folder);
            }
            folder.tasks.push(sortedTasks[i]);
            this.taskFolders = folders;
          }
        })
        .catch(handleError);
    },
    async onTaskClicked(id) {
      this.taskIdSelected = id;
      this.listGridPosition = "1";
    },
  },
};
</script>

<style scoped>
.task-list {
  width: 100%;
}

.task_page_container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 2fr;
  width: 100%;
  height: auto;
}

.task_page_list {
  grid-column: 1;
  overflow-x: hidden;
  overflow-y: auto;
  transition: grid-row 2s;
}

.task_page_detail {
  grid-column: 1;
  grid-row: 2;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #efebe9;
  border-top-style: solid;
  border-top-color: #bcaaa4;
  border-top-width: 1px;
  border-top-left-radius: 20px;
  border-top-right-radius: 10px;
  transition: grid-row 2s;
}
</style>
