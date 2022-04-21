<template>
  <div class="page_content_container">
    <h1>Agents</h1>
    <div class="agent-list row">
      <div
        v-for="agent in agents"
        v-bind:key="agent.id"
        class="col-sm-12 col-md-6 col-lg-4"
      >
        <Agent :agent="agent" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Agent from '../components/Agent.vue';
import Config from '../Config.ts';
import { AuthService } from '../services/AuthService';
import { handleError } from '../services/EventBus';

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
