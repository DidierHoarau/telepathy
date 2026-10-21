<template>
  <div class="page">
    <PageHeader
      eyebrow="Access"
      title="Users"
      description="Accounts allowed to sign in to this Telepathy instance."
    >
      <NuxtLink to="/users/new" class="btn btn-primary">
        <i class="bi bi-plus-lg" aria-hidden="true"></i>
        New user
      </NuxtLink>
    </PageHeader>

    <div v-if="loading" class="page-loading">
      <Loading size="small" label="Loading users" />
    </div>

    <EmptyState
      v-else-if="users.length === 0"
      icon="bi bi-people"
      title="No users yet"
      description="Create the first account to start using Telepathy."
    />

    <div v-else class="user-grid">
      <UserCard v-for="user in users" :key="user.id" :user="user" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from "~/types/telepathy";
import { api } from "~/services/Api";
import { notifyError } from "~/utils/notify";

useHead({ title: "Users · Telepathy" });

const users = ref<User[]>([]);
const loading = ref(true);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const { data } = await api.get("/users");
    users.value = data?.users ?? [];
  } catch (error) {
    notifyError(error);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
