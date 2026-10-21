import Fastify, { FastifyInstance } from "fastify";
import { User } from "../common-model/User";
import { Auth } from "../data/Auth";
import { UserPassword } from "../data/UserPassword";
import { UsersData } from "../data/UsersData";
import { UserRoutes } from "./UsersRoutes";

Auth.init({
  JWT_KEY: "test-jwt-key",
  JWT_VALIDITY_DURATION: 3600,
} as never);

const user = new User();
user.name = "alice";

const usersData = {
  list: async () => [user],
  getByName: async (_span, name: string) => (name === user.name ? user : null),
  get: async (_span, id: string) => (id === user.id ? user : null),
} as unknown as UsersData;

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify();
  await new UserRoutes(usersData).getRoutes(app);
  await app.ready();
  return app;
}

async function login(app: FastifyInstance): Promise<string> {
  const response = await app.inject({
    method: "POST",
    url: "/session",
    payload: { name: user.name, password: "correct-horse" },
  });
  expect(response.statusCode).toBe(201);
  return response.json().token;
}

beforeAll(async () => {
  await UserPassword.setPassword(null, user, "correct-horse");
});

test("session refresh returns a new valid token for an authenticated session", async () => {
  const app = await buildApp();
  const token = await login(app);

  const response = await app.inject({
    method: "POST",
    url: "/session/refresh",
    headers: { authorization: `Bearer ${token}` },
  });

  expect(response.statusCode).toBe(201);
  const refreshedToken = response.json().token;
  expect(typeof refreshedToken).toBe("string");
  const session = await Auth.checkToken(refreshedToken);
  expect(session.authenticated).toBe(true);
  expect(session.info.user_name).toBe(user.name);
  await app.close();
});

test("session refresh is denied without a token", async () => {
  const app = await buildApp();

  const response = await app.inject({ method: "POST", url: "/session/refresh" });

  expect(response.statusCode).toBe(403);
  await app.close();
});

test("session refresh is denied with an invalid token", async () => {
  const app = await buildApp();

  const response = await app.inject({
    method: "POST",
    url: "/session/refresh",
    headers: { authorization: "Bearer not-a-valid-token" },
  });

  expect(response.statusCode).toBe(403);
  await app.close();
});
