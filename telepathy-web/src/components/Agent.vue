<template>
  <div class="card-container col-sm-6 col-md-4 col-lg-3">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">{{ agent.id }}</h5>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Agent",
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
