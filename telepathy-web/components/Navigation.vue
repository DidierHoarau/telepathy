<template>
  <AppNavigation :links="[]">
    <template #brand>
      <NuxtLink to="/" class="brand-link" aria-label="Telepathy home">
        <img src="/icon.png" alt="" class="brand-logo" />
        <span class="brand-name">Telepathy</span>
      </NuxtLink>
    </template>

    <ul class="nav-links">
      <li v-for="link in links" :key="link.to">
        <NuxtLink
          :to="link.to"
          :aria-label="link.label"
          :class="{ active: isActive(link.to) }"
        >
          <i :class="link.icon" aria-hidden="true"></i>
          <span class="nav-label">{{ link.label }}</span>
        </NuxtLink>
      </li>
    </ul>

    <div class="nav-actions">
      <button
        type="button"
        class="icon-button"
        :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
        :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="toggleTheme"
      >
        <i :class="isDark ? 'bi bi-sun' : 'bi bi-moon-stars'"></i>
      </button>
      <NuxtLink
        v-if="authentication.isAuthenticated"
        to="/users/profile"
        class="avatar-link"
        :title="userName || 'Profile'"
        :aria-label="userName ? `Profile of ${userName}` : 'Profile'"
      >
        {{ initials }}
      </NuxtLink>
    </div>
  </AppNavigation>
</template>

<script setup lang="ts">
import { AuthService } from "@devopsplaybook.io/common-web/services/AuthService.ts";
import { AuthenticationStore } from "~/stores/AuthenticationStore";
import { useAppTheme } from "~/composables/useAppTheme";
import { userNameFromToken } from "~/utils/auth";

const authentication = AuthenticationStore();
const route = useRoute();
const { isDark, toggleTheme } = useAppTheme();
const userName = ref("");

const links = [
  { label: "Tasks", to: "/tasks", icon: "bi bi-terminal" },
  { label: "Agents", to: "/agents", icon: "bi bi-cpu" },
  { label: "Users", to: "/users", icon: "bi bi-people" },
];

const initials = computed(() => {
  const name = userName.value.trim();
  return name ? name.slice(0, 2).toUpperCase() : "?";
});

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(`${path}/`);
}

async function refreshIdentity(): Promise<void> {
  try {
    userName.value = userNameFromToken(await AuthService.getToken());
  } catch {
    userName.value = "";
  }
}

watch(
  () => authentication.isAuthenticated,
  (authenticated) => {
    if (authenticated) refreshIdentity();
    else userName.value = "";
  },
);

onMounted(async () => {
  await authentication.ensureAuthenticated();
  await refreshIdentity();
});
</script>
