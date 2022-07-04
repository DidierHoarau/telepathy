<template>
  <div class="page_content_container">
    <h1>Agents</h1>
    <div class="agent-list row">
      <div v-for="agent in agents" v-bind:key="agent.id" class="col-sm-12 col-md-6 col-lg-4">
        <AgentCard :agent="agent" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import AgentCard from "../components/AgentCard.vue";
import Config from "../Config.ts";
import { AuthService } from "../services/AuthService";
import { handleError } from "../services/EventBus";

export default {
  name: "AgentList",
  components: {
    AgentCard,
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
    async load() {
      axios
        .get(`${(await Config.get()).SERVER_URL}/agents`, await AuthService.getAuthHeader())
        .then((res) => {
          this.agents = res.data.agents;
        })
        .catch(handleError);
    },
  },
};
</script>

<style scoped>
.agent-list {
  width: 100%;
}
</style>
