import { AppContext } from "../appContext";
import { User } from "../common-model/user";
import { Auth } from "../data/auth";
import { UserPassword } from "../data/userPassword";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/handlers/userListHandler");

export class UserListHandler {
  //
  public static async checkInitialiation(req, res, next, stopAndSend): Promise<void> {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if ((await AppContext.getUsers().list()).length === 0) {
      res.status(201).json({ initialized: false });
    } else {
      res.status(201).json({ initialized: true });
    }
  }

  public static async login(req, res, next, stopAndSend): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.body.name) {
      stopAndSend(400, { error: "Missing: Name" });
    }
    if (!req.body.password) {
      stopAndSend(400, { error: "Missing: Password" });
    }
    const user = await AppContext.getUsers().getByName(req.body.name);
    if (!user) {
      stopAndSend(403, { error: "Authentication Failed" });
    } else if (await UserPassword.checkPassword(user, req.body.password)) {
      res.status(201).json({ success: true, token: await Auth.generateJWT(user) });
    } else {
      stopAndSend(403, { error: "Authentication Failed" });
    }
  }

  public static async list(req, res, next, stopAndSend): Promise<void> {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const users = await AppContext.getUsers().list();
    for (const user of users) {
      delete user.passwordEncrypted;
    }
    res.status(201).json({ users });
  }

  public static async add(req, res, next, stopAndSend): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    let isInitialized = true;
    if ((await AppContext.getUsers().list()).length === 0) {
      isInitialized = false;
    }
    if (isInitialized && !req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const newUser = new User();
    if (!req.body.name) {
      stopAndSend(400, { error: "Missing: Name" });
    }
    if (!req.body.password) {
      stopAndSend(400, { error: "Missing: Password" });
    }
    if (await AppContext.getUsers().getByName(req.body.name)) {
      stopAndSend(400, { error: "Username Already Exists" });
    }
    newUser.name = req.body.name;
    await UserPassword.setPassword(newUser, req.body.password);
    await AppContext.getUsers().add(newUser);
    res.status(201).json({});
  }
}
