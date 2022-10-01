import { Auth } from "./Auth";

test("get token if not empty", async () => {
  const header = await Auth.getAuthHeader(null);
});
