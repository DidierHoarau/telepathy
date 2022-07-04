<template>
  <div class="cardlayout">
    <div class="cardlayout_content">
      <h2>{{ user.name }}</h2>
    </div>
    <div class="cardlayout_actions">
      <p class="text-end">
        <router-link :to="'/users/' + user.id + '/edit'"><i class="bi bi-pencil-square icon-button"></i></router-link>
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

<style scoped>
.card {
  margin: 0.6rem 0.2rem 0.6rem 0.2rem;
}
</style>
