import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";

export class User {
  //
  public id: string;
  public name: string;
  public passwordEncrypted: string;

  constructor() {
    this.id = uuidv4();
  }

  public async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.passwordEncrypted = await bcrypt.hash(password, salt);
  }

  public async checkPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.passwordEncrypted); // updated
  }

  public static fromJson(json: any): User {
    if (!json) {
      return null;
    }
    const user = new User();
    if (json.id) {
      user.id = json.id;
    }
    user.id = json.id;
    user.name = json.name;
    user.passwordEncrypted = json.passwordEncrypted;
    return user;
  }

  public toJson(): any {
    return {
      id: this.id,
      name: this.name,
      passwordEncrypted: this.passwordEncrypted,
    };
  }
}
