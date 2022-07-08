<template>
  <div class="cardLayout">
    <div class="cardlayout_content">
      <h2>{{ user.name }}</h2>
    </div>
    <div class="cardlayout_actions">
      <p class="text-end">
        <router-link :to="'/users/' + user.id + '/edit'"><em class="bi bi-pencil-square icon-button"></em></router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserCard",
  props: {
    user: Object,
  },
  data() {
    return {};
  },
  methods: {},
};
</script>
