<template>
  <div class="page">
    <PageHeader
      eyebrow="Access"
      title="Edit user"
      description="Update the account name or set a new password."
    >
      <button type="button" class="btn btn-secondary" @click="cancel">Cancel</button>
      <button type="submit" form="userForm" class="btn btn-primary" :disabled="saving || loading">
        {{ saving ? "Saving…" : "Save changes" }}
      </button>
    </PageHeader>

    <div v-if="loading"><Loading size="small" label="Loading user" /></div>

    <div v-else class="form-grid">
      <form id="userForm" class="form-card form-stack" @submit.prevent="save">
        <h2>Account</h2>
        <div class="field">
          <label for="userName">Name</label>
          <input id="userName" v-model="name" type="text" autocomplete="off" required />
        </div>
        <div class="toggle-row">
          <label class="switch">
            <input v-model="passwordEnabled" type="checkbox" />
            Change password
          </label>
        </div>
        <div v-if="passwordEnabled" class="field">
          <label for="userPassword">New password</label>
          <input
            id="userPassword"
            v-model="password"
            type="password"
            autocomplete="new-password"
          />
        </div>
      </form>

      <div class="form-column">
        <section class="form-card form-stack">
          <h2>Session</h2>
          <p class="helper-text">
            Existing sessions stay valid until they expire or are renewed.
          </p>
        </section>

        <section class="form-card form-stack danger-zone">
          <h2>Danger zone</h2>
          <p class="helper-text">
            The account is removed immediately and can no longer sign in.
          </p>
          <button
            type="button"
            class="btn btn-danger-ghost"
            :disabled="deleting"
            @click="remove"
          >
            <i class="bi bi-trash" aria-hidden="true"></i>
            {{ confirmingDelete ? "Confirm delete" : "Delete user" }}
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from "~/types/telepathy";
import { api } from "~/services/Api";
import { errorMessage, notifyError, notifySuccess } from "~/utils/notify";

useHead({ title: "Edit user · Telepathy" });

const route = useRoute();
const userId = computed(() => String(route.params.userId ?? ""));

const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const confirmingDelete = ref(false);
const name = ref("");
const password = ref("");
const passwordEnabled = ref(false);
let confirmTimer: ReturnType<typeof setTimeout> | null = null;

async function load(): Promise<void> {
  loading.value = true;
  try {
    const { data } = await api.get(`/users/${userId.value}`);
    const user = data as User;
    name.value = user.name;
  } catch (error) {
    notifyError(error);
  } finally {
    loading.value = false;
  }
}

async function save(): Promise<void> {
  if (!name.value.trim()) {
    notifyError(new Error("Name is required"));
    return;
  }
  if (passwordEnabled.value && !password.value) {
    notifyError(new Error("Password is required"));
    return;
  }
  saving.value = true;
  try {
    await api.put(`/users/${userId.value}`, {
      name: name.value.trim(),
      ...(passwordEnabled.value ? { password: password.value } : {}),
    });
    password.value = "";
    passwordEnabled.value = false;
    notifySuccess("User updated");
  } catch (error) {
    notifyError(new Error(errorMessage(error)));
  } finally {
    saving.value = false;
  }
}

async function remove(): Promise<void> {
  if (!confirmingDelete.value) {
    confirmingDelete.value = true;
    confirmTimer = setTimeout(() => {
      confirmingDelete.value = false;
    }, 4000);
    return;
  }
  if (confirmTimer) clearTimeout(confirmTimer);
  confirmingDelete.value = false;
  deleting.value = true;
  try {
    await api.delete(`/users/${userId.value}`);
    notifySuccess("User deleted");
    await navigateTo("/users");
  } catch (error) {
    notifyError(error);
  } finally {
    deleting.value = false;
  }
}

function cancel(): void {
  navigateTo("/users");
}

onMounted(load);

onUnmounted(() => {
  if (confirmTimer) clearTimeout(confirmTimer);
});
</script>

<style scoped>
.danger-zone {
  border-color: color-mix(in srgb, var(--color-danger) 35%, var(--color-border));
}
</style>
