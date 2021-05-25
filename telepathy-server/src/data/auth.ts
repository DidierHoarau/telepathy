import * as jwt from "jsonwebtoken";
import { AppContext } from "../appContext";
import { User } from "../common-model/user";

export class Auth {
  //
  public static async generateJWT(user: User): Promise<string> {
    return jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + AppContext.getConfig().JWT_VALIDITY_DURATION,
        user_id: user.id,
        user_name: user.name,
      },
      AppContext.getConfig().JWT_KEY
    );
  }

  public static async checkToken(token: string): Promise<any> {
    try {
      const info = jwt.verify(token, AppContext.getConfig().JWT_KEY);
      return { authenticated: true, info };
    } catch (err) {
      return {
        authenticated: false,
      };
    }
  }
}
