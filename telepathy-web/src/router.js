import { createWebHistory, createRouter } from "vue-router";
import TaskList from "./pages/TaskList.vue";
import TaskEdit from "./pages/TaskEdit.vue";
import AgentList from "./pages/AgentList.vue";
import UserList from "./pages/UserList.vue";

const history = createWebHistory();

const routes = [
  { path: "/", component: TaskList },
  { path: "/tasks", component: TaskList },
  { path: "/tasks/new", component: TaskEdit },
  { path: "/agents", component: AgentList },
  { path: "/users", component: UserList },
];

const router = createRouter({ history, routes });

export default router;
