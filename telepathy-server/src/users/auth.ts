import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { User } from "../common-model/user";
import { config } from "../config";

const AUTH_KEY = uuidv4();

export class Auth {
  //
  public static async generateJWT(user: User): Promise<string> {
    return jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + config.JWT_VALIDITY_DURATION,
        user_id: user.id,
        user_name: user.name,
      },
      AUTH_KEY
    );
  }

  public static async checkToken(token: string): Promise<any> {
    try {
      const info = jwt.verify(token, AUTH_KEY);
      return { authenticated: true, info };
    } catch (err) {
      return {
        authenticated: false,
      };
    }
  }
}
