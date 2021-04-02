<template>
  <div class="container">
    <h1>Agents</h1>
    <div class="agent-list row">
      <Agent v-for="agent in agents" v-bind:key="agent.id" :agent="agent" />
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

import axios from "axios";
import Agent from "../components/Agent.vue";
import Config from "../Config.ts";
import { AuthService } from "../services/AuthService";
import { handleError } from "../services/EventBus";

@Options({
  components: {
    Agent,
  },
})
export default class AgentList extends Vue {
  agents: any[] = [];

  created() {
    this.load();
  }

  async load() {
    axios
      .get(`${(await Config.get()).SERVER_URL}/agents`, await AuthService.getAuthHeader())
      .then((res) => {
        this.agents = res.data.agents;
      })
      .catch(handleError);
  }
}
</script>

<style scoped>
.agent-list {
  width: 100%;
}
</style>
