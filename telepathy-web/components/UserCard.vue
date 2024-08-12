<template>
  <article class="cardLayout">
    <div class="cardlayout_content">
      <h3>{{ user.name }}</h3>
    </div>
    <div class="cardlayout_actions">
      <p class="text-end">
        <router-link :to="'/users/' + user.id + '/edit'"><em class="bi bi-pencil-square icon-button"></em></router-link>
      </p>
    </div>
  </article>
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
