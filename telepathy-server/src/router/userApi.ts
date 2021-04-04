import * as express from "express";
import * as _ from "lodash";
import { AppContext } from "../appContext";
import { User } from "../common-model/user";
import { Auth } from "../data/auth";
import { UserHandler } from "../handler/userHandler";
import { UserListHandler } from "../handler/userListHandler";
import { ExpressRouterWrapper as ERW } from "../utils-std-ts/express-router-wrapper";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/userApi");

export const userApi = express.Router();

ERW.route(userApi, "get", "/initialization", async (req, res, next, stopAndSend) => {
  logger.info(`[${req.method}] ${req.originalUrl}`);
  if ((await AppContext.getUsers().list()).length === 0) {
    res.status(201).json({ initialized: false });
  } else {
    res.status(201).json({ initialized: true });
  }
});

ERW.route(userApi, "post", "/session", UserListHandler.login);

ERW.route(userApi, "get", "/", UserListHandler.list);

ERW.route(userApi, "post", "/", UserListHandler.add);

ERW.route(userApi, "get", "/:userId", UserHandler.get);

ERW.route(userApi, "put", "/:userId", UserHandler.update);

ERW.route(userApi, "delete", "/:userId", UserHandler.delete);
