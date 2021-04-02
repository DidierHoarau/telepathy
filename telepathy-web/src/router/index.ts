import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import TaskList from "../views/TaskList.vue";
import TaskEdit from "../views/TaskEdit.vue";
import AgentList from "../views/AgentList.vue";
import UserList from "../views/UserList.vue";
import UserEdit from "../views/UserEdit.vue";
import UserLogin from "../views/UserLogin.vue";

const routes: Array<RouteRecordRaw> = [
  { path: "/", component: TaskList },
  { path: "/tasks", component: TaskList },
  { path: "/tasks/new", component: TaskEdit },
  {
    path: "/tasks/:taskId/edit",
    component: TaskEdit,
    props: (route) => ({
      taskId: route.params.taskId,
    }),
  },
  { path: "/agents", component: AgentList },
  { path: "/users", component: UserList },
  { path: "/users/login", component: UserLogin },
  { path: "/users/new", component: UserEdit },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
