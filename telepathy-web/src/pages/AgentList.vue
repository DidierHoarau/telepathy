<template>
  <div class="container">
    <h1>Agents</h1>
    <div class="agent-list row">
      <Agent v-for="agent in agents" v-bind:key="agent.id" :agent="agent" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Agent from '../components/Agent.vue';
import Config from '../Config.ts';
import { AuthService } from '../services/AuthService';

export default {
  name: 'Agents',
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
    async load() {
      axios
        .get(
          `${(await Config.get()).SERVER_URL}/agents`,
          await AuthService.getAuthHeader()
        )
        .then((res) => {
          this.agents = res.data.agents;
        })
        .catch((error) => {
          EventBus.emit(EventTypes.ALERT_MESSAGE, {
            type: 'error',
            text: error.message,
          });
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
