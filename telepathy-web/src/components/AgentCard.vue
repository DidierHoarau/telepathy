<template>
  <div class="cardLayout">
    <div class="cardlayout_content">
      <h2 class="card-title">{{ agent.id }}</h2>
      <p>
        <span v-for="tag in agent.tags" v-bind:key="tag">
          <span class="badge bg-secondary">{{ tag }}</span
          >&nbsp;
        </span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "AgentCard",
  props: {
    agent: Object,
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<style scoped></style>
