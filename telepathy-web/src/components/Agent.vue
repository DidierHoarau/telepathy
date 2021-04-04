<template>
  <div class="card-container col-sm-12 col-md-6 col-lg-4">
    <div class="card text-dark bg-light mb-3">
      <div class="card-body">
        <h5 class="card-title">{{ agent.id }}</h5>
        <p>
          <span v-for="tag in agent.tags" v-bind:key="tag">
            <span class="badge bg-secondary">{{ tag }}</span
            >&nbsp;
          </span>
        </p>
      </div>
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
