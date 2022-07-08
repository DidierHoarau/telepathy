<template>
  <div class="pageContent">
    <div class="pageHeader">
      <h1>Agents</h1>
    </div>
    <div class="cardList">
      <div v-for="agent in agents" v-bind:key="agent.id">
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