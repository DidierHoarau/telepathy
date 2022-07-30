import * as _ from "lodash";
import { User } from "../common-model/user";
import { FileDBUtils } from "./fileDbUtils";

export class Users {
  //
  public users: User[];

  public async load(): Promise<void> {
    this.users = await FileDBUtils.load("users", []);
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
    return _.cloneDeep(this.users);
  }

  public async add(user: User): Promise<void> {
    this.users.push(user);
    await this.save();
  }

  public async update(id: string, userUpdate: User): Promise<void> {
    const user = _.find(this.users, {
      id,
    }) as User;
    user.name = userUpdate.name;
    user.passwordEncrypted = userUpdate.passwordEncrypted;
    await this.save();
  }

  public async save(): Promise<void> {
    await FileDBUtils.save("users", this.users);
  }

  public async delete(id: string): Promise<void> {
    const position = _.findIndex(this.users, {
      id,
    });
    if (position >= 0) {
      this.users.splice(position, 1);
    }
    await this.save();
  }
}
