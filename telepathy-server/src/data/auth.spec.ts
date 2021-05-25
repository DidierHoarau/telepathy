import { User } from "../common-model/user";
import { Auth } from "./auth";

test("it should generate a JWT for a user", () => {
  const user = new User();
  user.name = "myusername";
  user.passwordEncrypted = "mypassword";
  Auth.generateJWT(user);
});
