import * as jwt from "jsonwebtoken";
import * as path from "path";
import { AppContext } from "../appContext";
import { User } from "../common-model/user";
import { UserSession } from "../common-model/userSession";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger(path.basename(__filename));

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

  public static async mustBeAuthenticated(req: any, res: any): Promise<void> {
    let authenticated = false;
    if (req.headers.authorization) {
      try {
        jwt.verify(req.headers.authorization.split(" ")[1], AppContext.getConfig().JWT_KEY);
        authenticated = true;
      } catch (err) {
        authenticated = false;
      }
    }
    if (!authenticated) {
      res.status(403).send({ error: "Access Denied" });
      throw new Error("Access Denied");
    }
  }

  public static async getUserSession(req: any): Promise<UserSession> {
    const userSession: UserSession = { isAuthenticated: false };
    if (req.headers.authorization) {
      try {
        userSession.userId = await Auth.checkToken(req.headers.authorization.split(" ")[1]);
        userSession.isAuthenticated = true;
      } catch (err) {
        logger.error(err);
      }
    }
    return userSession;
  }
}
