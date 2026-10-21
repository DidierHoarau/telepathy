import axios from "axios";
import { AuthService } from "@devopsplaybook.io/common-web/services/AuthService.ts";

export const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Token renewal can fail while offline; the request then runs unsigned
    // and the API answers with a regular authentication error.
  }
  return config;
});
