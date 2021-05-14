import * as fs from "fs-extra";
import { User } from "../common-model/user";
import { Users } from "./users";

jest.mock("fs");

test("Get an empty list of user by default", async () => {
  jest.spyOn(fs, "existsSync").mockImplementation(() => {
    return false;
  });
  jest.spyOn(fs, "writeJSON").mockImplementation(async () => {
    return;
  });
  jest.spyOn(fs, "existsSync");
  const users = new Users();
  expect(await users.list()).toHaveLength(0);
});

test("Add a user", async () => {
  jest.spyOn(fs, "existsSync").mockImplementation(() => {
    return false;
  });
  jest.spyOn(fs, "writeJSON").mockImplementation(async () => {
    return;
  });
  jest.spyOn(fs, "existsSync");
  const users = new Users();
  const user = new User();
  user.name = "username";
  user.passwordEncrypted = "password";
  await users.add(user);
  expect(await users.list()).toHaveLength(1);
});

test("Add 2 user", async () => {
  jest.spyOn(fs, "existsSync").mockImplementation(() => {
    return false;
  });
  jest.spyOn(fs, "writeJSON").mockImplementation(async () => {
    return;
  });
  jest.spyOn(fs, "existsSync");
  const users = new Users();
  const user = new User();
  user.name = "username";
  user.passwordEncrypted = "password";
  await users.add(user);
  const user2 = new User();
  user2.name = "username";
  user2.passwordEncrypted = "password";
  await users.add(user2);
  expect(await users.list()).toHaveLength(2);
});

test("List users", async () => {
  jest.spyOn(fs, "existsSync").mockImplementation(() => {
    return false;
  });
  jest.spyOn(fs, "writeJSON").mockImplementation(async () => {
    return;
  });
  jest.spyOn(fs, "existsSync");
  const users = new Users();
  const user = new User();
  user.name = "username";
  user.passwordEncrypted = "password";
  await users.add(user);
  const user2 = new User();
  user2.name = "username";
  user2.passwordEncrypted = "password";
  await users.add(user2);
  const userlist = await users.list();
  userlist[0].name = "foo";
  expect(userlist[1].name).toEqual((await users.list())[1].name);
  expect(userlist[0].name).not.toEqual((await users.list())[0].name);
});
