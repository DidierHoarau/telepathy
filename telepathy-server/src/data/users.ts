import * as fs from "fs-extra";
import * as _ from "lodash";
import { User } from "../common-model/user";
import { config } from "../config";

export class Users {
  //
  public users: User[];
  constructor() {
    if (fs.existsSync(`${config.DATA_DIR}/users.json`)) {
      fs.readJSON(`${config.DATA_DIR}/users.json`).then((data) => {
        this.users = data;
      });
    } else {
      this.users = [];
      this.save();
    }
  }

  public async get(id: string): Promise<User> {
    return User.fromJson(
      _.find(this.users, {
        id,
      })
    );
  }

  public async getByName(name: string): Promise<User> {
    return User.fromJson(
      _.find(this.users, {
        name,
      })
    );
  }

  public async list(): Promise<User[]> {
    return this.users;
  }

  public async add(user: User): Promise<void> {
    this.users.push(user);
    await this.save();
  }

  public async save(): Promise<void> {
    await fs.writeJSON(`${config.DATA_DIR}/users.json`, this.users);
  }
}