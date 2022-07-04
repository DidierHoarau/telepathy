import { Auth } from "./auth";

test("get token if not empty", async () => {
  const header = await Auth.getAuthHeader();
});
