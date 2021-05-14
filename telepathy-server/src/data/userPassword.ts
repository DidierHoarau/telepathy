import * as bcrypt from "bcrypt";
import { User } from "../common-model/user";

export class UserPassword {
  //
  public static async setPassword(user: User, password: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    user.passwordEncrypted = await bcrypt.hash(password, salt);
  }

  public static async checkPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.passwordEncrypted);
  }
}
