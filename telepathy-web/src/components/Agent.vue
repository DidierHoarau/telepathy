<template>
  <div class="cardlayout">
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
  name: 'Agent',
  props: {
    agent: Object,
  },
  data() {
    return {};
  },
  setup() {},
  created() {},
  methods: {},
};
</script>

<style scoped>
.card {
  margin: 0.6rem 0.2rem 0.6rem 0.2rem;
}
</style>
