import { User } from "../common-model/user";
import { UserPassword } from "./userPassword";

test("Password should be successfully verified if it's the same", async () => {
  const password = "testPassword1234";
  const user = new User();
  await UserPassword.setPassword(user, password);
  expect(await UserPassword.checkPassword(user, password)).toBeTruthy();
});

test("Password should be faile to be verified if it's not the same", async () => {
  const password = "testPassword1234";
  const passwordWrong = "testPassword12345";
  const user = new User();
  await UserPassword.setPassword(user, password);
  expect(await UserPassword.checkPassword(user, passwordWrong)).toBeFalsy();
});
