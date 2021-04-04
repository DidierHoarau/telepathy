<template>
  <div class="card-container col-sm-12 col-md-6 col-lg-4">
    <div class="card text-dark bg-light mb-3">
      <div class="card-body">
        <div class="row m-0 p-4">
          <div class="col-11 m-0 p-0">
            <h5 class="card-title">{{ user.name }}</h5>
          </div>
          <div class="col-1 m-0 p-0">
            <p class="text-end">
              <router-link :to="'/users/' + user.id + '/edit'"
                ><i class="bi bi-pencil-square icon-button"></i
              ></router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Agent',
  props: {
    user: Object,
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
