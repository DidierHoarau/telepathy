<template>
  <div :class="gettaskPanelWrapperClass()">
    <div class="pageContent taskListPanel">
      <div class="pageHeader">
        <h1>Tasks</h1>
        <router-link id="addTaskButton" to="/tasks/new"><em class="bi bi-plus-square icon-button"></em></router-link>
      </div>
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
    <Transition>
      <div v-if="taskIdSelected" class="taskDetailPanel">
        <TaskExecutions :taskId="taskIdSelected" />
      </div>
    </Transition>
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
    gettaskPanelWrapperClass() {
      if (this.taskIdSelected) {
        return "taskPanelWrapper taskPanelWrapper_showExecution";
      }
      return "taskPanelWrapper taskPanelWrapper_hideExecution";
    },
  },
};
</script>

<style scoped>
.taskDetailPanel {
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #efebe9;
  border-top-style: solid;
  border-top-color: #bcaaa4;
  border-top-width: 1px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  grid-column: 1;
  grid-row: 2;
  height: 40vh;
  padding: 1em;
}

.taskListPanel {
  grid-column: 1;
  grid-row: 1;
  overflow: hidden;
  overflow-y: scroll;
}

.taskPanelWrapper {
  display: grid;
  height: 100%;
}

.taskPanelWrapper_hideExecution {
  grid-template-rows: 1fr;
}

.taskPanelWrapper_showExecution {
  grid-template-rows: 2fr 1fr;
}
</style>
