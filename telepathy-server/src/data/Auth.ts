import * as jwt from "jsonwebtoken";
import * as path from "path";
import { User } from "../common-model/User";
import { UserSession } from "../common-model/UserSession";
import { Config } from "../Config";
import { OTelLogger } from "../OTelContext";

const logger = OTelLogger().createModuleLogger(path.basename(__filename));
let config: Config;

export class Auth {
  //
  public static init(configIn: Config) {
    config = configIn;
  }

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
    } catch {
      return {
        authenticated: false,
      };
    }
  }

  public static async mustBeAuthenticated(req: any, res: any): Promise<void> {
    let authenticated = false;
    if (req.headers.authorization) {
      try {
        jwt.verify(req.headers.authorization.split(" ")[1], config.JWT_KEY);
        authenticated = true;
      } catch {
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
        logger.error("Failed to decode user session", err as Error);
      }
    }
    return userSession;
  }
}
