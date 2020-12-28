<template>
  <nav
    id="sidebarMenu"
    class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"
  >
    <div class="position-sticky pt-3">
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link to="/tasks">Tasks</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/agents">Agents</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/users">Users</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Navigation",
};
</script>

<style scoped></style>
