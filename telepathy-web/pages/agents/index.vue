<template>
  <div class="pageContent">
    <div class="page_header">
      <h2>Agents</h2>
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
import AgentCard from "~/components/AgentCard.vue";
import { AuthService } from "~/services/AuthService";
import { handleError } from "~/services/EventBus";

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
        .get(`/api/agents`, await AuthService.getAuthHeader())
        .then((res) => {
          this.agents = res.data.agents;
        })
        .catch(handleError);
    },
  },
};
</script>
