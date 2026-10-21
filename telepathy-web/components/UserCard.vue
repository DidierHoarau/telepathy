<template>
  <article class="user-card">
    <span class="avatar" aria-hidden="true">{{ initials }}</span>
    <div class="user-card-body">
      <h3 :title="user.name">{{ user.name }}</h3>
      <p>Member</p>
    </div>
    <NuxtLink
      :to="`/users/${user.id}/edit`"
      class="icon-button"
      :aria-label="`Edit ${user.name}`"
      title="Edit user"
    >
      <i class="bi bi-pencil" aria-hidden="true"></i>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import type { User } from "~/types/telepathy";

const props = defineProps<{ user: User }>();

const initials = computed(() => {
  const name = props.user.name?.trim();
  return name ? name.slice(0, 2).toUpperCase() : "?";
});
</script>
