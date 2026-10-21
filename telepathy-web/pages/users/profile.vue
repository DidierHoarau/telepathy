<template>
  <div class="page">
    <PageHeader
      eyebrow="Account"
      title="Profile"
      description="Manage your session and how Telepathy looks."
    />

    <div class="profile-grid">
      <section class="profile-card">
        <h2>Identity</h2>
        <div class="profile-identity">
          <span class="avatar avatar-lg" aria-hidden="true">{{ initials }}</span>
          <div>
            <h3>{{ userName || "Unknown user" }}</h3>
            <p>Telepathy account</p>
          </div>
        </div>
      </section>

      <section class="profile-card">
        <h2>Appearance</h2>
        <p class="helper-text">Choose a theme or follow your system preference.</p>
        <div class="segmented" role="group" aria-label="Theme preference">
          <button
            v-for="option in themes"
            :key="option.value"
            type="button"
            :class="{ active: preference === option.value }"
            :aria-pressed="preference === option.value"
            @click="setTheme(option.value)"
          >
            <i :class="option.icon" aria-hidden="true"></i>
            {{ option.label }}
          </button>
        </div>
      </section>

      <section class="profile-card">
        <h2>Session</h2>
        <p v-if="expiry" class="helper-text">
          Signed in until <strong>{{ expiry.toLocaleString() }}</strong>. The
          session renews automatically while you use the app.
        </p>
        <p v-else class="helper-text">Session information is unavailable.</p>
        <button type="button" id="logoutButton" class="btn btn-danger-ghost" @click="logout">
          <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
          Sign out
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AuthService } from "@devopsplaybook.io/common-web/services/AuthService.ts";
import {
  EventBus,
  EventTypes,
} from "@devopsplaybook.io/common-web/composables/EventBus.ts";
import type { ThemePreference } from "@devopsplaybook.io/common-web/composables/useTheme.ts";
import { useAppTheme } from "~/composables/useAppTheme";
import { AuthenticationStore } from "~/stores/AuthenticationStore";
import { tokenExpiry, userNameFromToken } from "~/utils/auth";
import { notifySuccess } from "~/utils/notify";

useHead({ title: "Profile · Telepathy" });

const authentication = AuthenticationStore();
const { preference, setTheme } = useAppTheme();

const userName = ref("");
const expiry = ref<Date | null>(null);

const themes: { value: ThemePreference; label: string; icon: string }[] = [
  { value: "system", label: "System", icon: "bi bi-circle-half" },
  { value: "light", label: "Light", icon: "bi bi-sun" },
  { value: "dark", label: "Dark", icon: "bi bi-moon-stars" },
];

const initials = computed(() => {
  const name = userName.value.trim();
  return name ? name.slice(0, 2).toUpperCase() : "?";
});

async function logout(): Promise<void> {
  await AuthService.removeToken();
  await authentication.ensureAuthenticated();
  EventBus.emit(EventTypes.AUTH_UPDATED);
  notifySuccess("Signed out");
  await navigateTo("/users/login");
}

onMounted(async () => {
  const token = await AuthService.getToken();
  userName.value = userNameFromToken(token);
  expiry.value = tokenExpiry(token);
});
</script>
