<template>
  <div class="tasks_wrapper">
    <div class="page_header">
      <h2>Tasks</h2>
      <router-link id="addTaskButton" to="/tasks/new"><em class="bi bi-plus-square icon-button"></em></router-link>
    </div>
    <div class="task_list">
      <div v-for="folder in taskFolders" v-bind:key="folder.name">
        <div class="pageSeparator" v-if="taskFolders.length > 0" />
        <h3 v-if="folder.name">{{ folder.name }}</h3>
        <div id="taskList" class="cardList">
          <TaskCard
            v-for="task in folder.tasks"
            v-bind:key="task.id"
            v-on:click="onTaskClicked(task.id)"
            :task="task"
          />
        </div>
      </div>
    </div>
    <div v-if="taskIdSelected" class="task_detail">
      <Transition>
        <TaskExecutions :taskId="taskIdSelected" />
      </Transition>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as _ from "lodash";
import TaskCard from "~/components/TaskCard.vue";
import TaskExecutions from "~/components/TaskExecutions.vue";
import Config from "~~/services/Config.ts";
import { EventBus, EventTypes, handleError } from "~/services/EventBus";
import { AuthService } from "~/services/AuthService";

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
    };
  },
  created() {
    this.load();
    EventBus.on(EventTypes.TASK_UPDATED, (event) => {
      this.load();
    });
    EventBus.on(EventTypes.TASK_EXECUTION_CLOSED, (event) => {
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
    },
  },
};
</script>

<style scoped>
.tasks_wrapper {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
}

.page_header {
  display: grid;
  grid-template-columns: 1fr auto;
  padding: 1em;
}

.task_list {
  height: 100%;
  overflow: auto;
}

.task_detail {
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #efebe933;
  border-top-style: solid;
  border-top-width: 1px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  height: 50vh;
  padding: 1em;
}

.taskPanelWrapper {
  display: grid;
  height: 100%;
}
</style>
