<template>
  <div class="pageContent">
    <div class="pageHeader">
      <h1>Tasks</h1>
      <router-link id="addTaskButton" to="/tasks/new"><em class="bi bi-plus-square icon-button"></em></router-link>
    </div>
    <div v-for="folder in taskFolders" v-bind:key="folder.name">
      <div class="pageSeparator" v-if="taskFolders.length > 0" />
      <h3 v-if="folder.name">{{ folder.name }}</h3>
      <div id="taskList" class="cardList">
        <TaskCard v-for="task in folder.tasks" v-bind:key="task.id" v-on:click="onTaskClicked(task.id)" :task="task" />
      </div>
    </div>
    <div v-if="taskIdSelected" class="taskDetailPanel">
      <TaskExecutions :taskId="taskIdSelected" />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as _ from "lodash";
import TaskCard from "../components/TaskCard.vue";
import TaskExecutions from "../components/TaskExecutions.vue";
import Config from "../Config.ts";
import { EventBus, EventTypes, handleError } from "../services/EventBus";
import { AuthService } from "../services/AuthService";

export default {
  name: "TaskList",
  components: {
    TaskCard,
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
.taskDetailPanel {
  position: fixed;
  margin-left: 0em;
  width: calc(100%-2em);
  bottom: 0px;
  right: 0px;
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
