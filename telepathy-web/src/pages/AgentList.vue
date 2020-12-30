<template>
  <div class="container">
    <h1>Agents</h1>
    <div class="agent-list row">
      <Agent v-for="agent in agents" v-bind:key="agent.id" :agent="agent" />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Agent from "../components/Agent.vue";

export default {
  name: "Agents",
  components: {
    Agent,
  },
  data() {
    return {
      agents: [],
    };
  },
  created() {
    this.load();
  },
  methods: {
    load() {
      axios
        .get("http://localhost:8080/agents")
        .then((res) => {
          this.agents = res.data.agents;
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script>

<style scoped>
.agent-list {
  width: 100%;
}
</style>
