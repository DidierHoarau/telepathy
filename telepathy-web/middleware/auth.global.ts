import { AuthenticationStore } from "~/stores/AuthenticationStore";
import { api } from "~/services/Api";

export default defineNuxtRouteMiddleware(async (to) => {
  const initialized = useState<boolean | null>(
    "server-initialized",
    () => null,
  );

  if (initialized.value === null) {
    try {
      const { data } = await api.get("/users/status/initialization");
      initialized.value = Boolean(data?.initialized);
    } catch {
      // Let the app render; individual pages surface API errors.
      return;
    }
  }

  const authentication = AuthenticationStore();
  const authenticated = await authentication.ensureAuthenticated();

  if (!initialized.value) {
    return to.path === "/users/new" ? undefined : navigateTo("/users/new");
  }

  if (!authenticated) {
    return to.path === "/users/login" ? undefined : navigateTo("/users/login");
  }

  if (to.path === "/users/login") {
    return navigateTo("/tasks");
  }
});
