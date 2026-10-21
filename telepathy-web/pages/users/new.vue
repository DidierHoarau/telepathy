<template>
  <div v-if="isSetup" class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <img src="/icon.png" alt="" />
        <h1>Welcome to Telepathy</h1>
        <p>Create the administrator account to finish setting up this instance.</p>
      </div>

      <form class="auth-form" @submit.prevent="create">
        <div class="field">
          <label for="newUserName">Name</label>
          <input id="newUserName" v-model="name" type="text" autocomplete="username" autofocus required />
        </div>
        <div class="field">
          <label for="newUserPassword">Password</label>
          <input
            id="newUserPassword"
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
          />
        </div>
        <div class="field">
          <label for="newUserPasswordConfirm">Confirm password</label>
          <input
            id="newUserPasswordConfirm"
            v-model="confirmation"
            type="password"
            autocomplete="new-password"
            required
          />
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button type="submit" class="btn btn-primary auth-submit" :disabled="submitting">
          {{ submitting ? "Creating…" : "Create administrator" }}
        </button>
      </form>
    </div>
  </div>

  <div v-else class="page">
    <PageHeader
      eyebrow="Access"
      title="New user"
      description="Create an account that can sign in to this Telepathy instance."
    />

    <form class="form-card form-stack narrow-form" @submit.prevent="create">
      <div class="field">
        <label for="newUserName">Name</label>
        <input id="newUserName" v-model="name" type="text" autocomplete="off" required />
      </div>
      <div class="field">
        <label for="newUserPassword">Password</label>
        <input
          id="newUserPassword"
          v-model="password"
          type="password"
          autocomplete="new-password"
          required
        />
      </div>
      <div class="field">
        <label for="newUserPasswordConfirm">Confirm password</label>
        <input
          id="newUserPasswordConfirm"
          v-model="confirmation"
          type="password"
          autocomplete="new-password"
          required
        />
      </div>

      <p v-if="error" class="form-error">{{ error }}</p>

      <div class="form-actions">
        <NuxtLink to="/users" class="btn btn-secondary">Cancel</NuxtLink>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? "Creating…" : "Create user" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { AuthService } from "@devopsplaybook.io/common-web/services/AuthService.ts";
import {
  EventBus,
  EventTypes,
} from "@devopsplaybook.io/common-web/composables/EventBus.ts";
import { api } from "~/services/Api";
import { AuthenticationStore } from "~/stores/AuthenticationStore";
import { errorMessage, notifySuccess } from "~/utils/notify";

useHead({ title: "New user · Telepathy" });

const initialized = useState<boolean | null>("server-initialized", () => null);
const authentication = AuthenticationStore();
const isSetup = computed(() => initialized.value === false);

const name = ref("");
const password = ref("");
const confirmation = ref("");
const error = ref("");
const submitting = ref(false);

function validate(): boolean {
  if (!name.value.trim() || !password.value) {
    error.value = "Name and password are required";
    return false;
  }
  if (password.value !== confirmation.value) {
    error.value = "Passwords do not match";
    return false;
  }
  return true;
}

async function create(): Promise<void> {
  error.value = "";
  if (!validate()) return;
  submitting.value = true;
  try {
    await api.post("/users", {
      name: name.value.trim(),
      password: password.value,
    });

    if (isSetup.value) {
      const { data } = await api.post("/users/session", {
        name: name.value.trim(),
        password: password.value,
      });
      await AuthService.saveToken(data.token);
      initialized.value = true;
      await authentication.ensureAuthenticated();
      EventBus.emit(EventTypes.AUTH_UPDATED);
      notifySuccess("Welcome to Telepathy");
      await navigateTo("/tasks");
    } else {
      notifySuccess("User created");
      await navigateTo("/users");
    }
  } catch (requestError) {
    error.value = errorMessage(requestError);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.narrow-form {
  max-width: 28rem;
}
</style>
