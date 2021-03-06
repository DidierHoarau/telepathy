import { AppContext } from "../appContext";
import { User } from "../common-model/user";
import { UserPassword } from "../data/userPassword";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/handlers/userHandler");

export class UserHandler {
  //
  public static async get(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.debug(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const user = await AppContext.getUsers().get(req.params.userId);
    if (!user) {
      stopAndSend(404, { error: "Not Found" });
    }
    delete user.passwordEncrypted;
    res.status(201).json(user);
  }

  public static async update(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const user = await AppContext.getUsers().get(req.params.userId);
    if (!user) {
      stopAndSend(404, { error: "Not Found" });
    }
    const userUpddate = new User();
    if (!req.body.name) {
      stopAndSend(400, { error: "Missing: Name" });
    }
    userUpddate.name = req.body.name;
    if (req.body.password) {
      await UserPassword.setPassword(userUpddate, req.body.password);
    }
    await AppContext.getUsers().update(user.id, userUpddate);
    res.status(201).json({});
  }

  public static async delete(req: any, res: any, next: any, stopAndSend: any): Promise<void> {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if (!req.user.authenticated) {
      stopAndSend(403, { error: "Access Denied" });
    }
    const user = await AppContext.getUsers().get(req.params.userId);
    if (!user) {
      stopAndSend(404, { error: "Not Found" });
    }
    await AppContext.getUsers().delete(user.id);
    res.status(201).json({});
  }
}
