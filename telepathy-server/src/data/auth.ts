import * as jwt from "jsonwebtoken";
import { User } from "../common-model/user";
import { config } from "../config";

export class Auth {
  //
  public static async generateJWT(user: User): Promise<string> {
    return jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + config.JWT_VALIDITY_DURATION,
        user_id: user.id,
        user_name: user.name,
      },
      config.JWT_KEY
    );
  }

  public static async checkToken(token: string): Promise<any> {
    try {
      const info = jwt.verify(token, config.JWT_KEY);
      return { authenticated: true, info };
    } catch (err) {
      return {
        authenticated: false,
      };
    }
  }
}
