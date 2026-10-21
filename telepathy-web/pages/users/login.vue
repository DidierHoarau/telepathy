<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <img src="/icon.png" alt="" />
        <h1>Welcome back</h1>
        <p>Sign in to Telepathy to manage tasks and agents.</p>
      </div>

      <form class="auth-form" @submit.prevent="login">
        <div class="field">
          <label for="username">Name</label>
          <input
            id="username"
            v-model="name"
            type="text"
            autocomplete="username"
            autofocus
            required
          />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button id="loginButton" type="submit" class="btn btn-primary auth-submit" :disabled="submitting">
          <i v-if="submitting" class="bi bi-arrow-repeat" aria-hidden="true"></i>
          {{ submitting ? "Signing in…" : "Sign in" }}
        </button>
      </form>
    </div>
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

useHead({ title: "Sign in · Telepathy" });

const authentication = AuthenticationStore();
const name = ref("");
const password = ref("");
const error = ref("");
const submitting = ref(false);

async function login(): Promise<void> {
  error.value = "";
  submitting.value = true;
  try {
    const { data } = await api.post("/users/session", {
      name: name.value.trim(),
      password: password.value,
    });
    await AuthService.saveToken(data.token);
    await authentication.ensureAuthenticated();
    EventBus.emit(EventTypes.AUTH_UPDATED);
    notifySuccess("Authentication successful");
    await navigateTo("/tasks");
  } catch (requestError) {
    error.value = errorMessage(requestError);
  } finally {
    submitting.value = false;
  }
}
</script>
