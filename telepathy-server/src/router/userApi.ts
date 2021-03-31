import * as express from "express";
import * as _ from "lodash";
import { AppContext } from "../appContext";
import { User } from "../common-model/user";
import { Auth } from "../data/auth";
import { ExpressRouterWrapper as ERW } from "../utils-std-ts/express-router-wrapper";
import { Logger } from "../utils-std-ts/logger";

const logger = new Logger("router/userApi");

export const userApi = express.Router();

ERW.route(
  userApi,
  "get",
  "/initialization",
  async (req, res, next, stopAndSend) => {
    logger.info(`[${req.method}] ${req.originalUrl}`);
    if ((await AppContext.getUsers().list()).length === 0) {
      res.status(201).json({ initialized: false });
    } else {
      res.status(201).json({ initialized: true });
    }
  }
);

ERW.route(userApi, "post", "/session", async (req, res, next, stopAndSend) => {
  logger.info(`[${req.method}] ${req.originalUrl}`);
  if (!req.body.name) {
    stopAndSend(400, { error: "Missing: Name" });
  }
  if (!req.body.password) {
    stopAndSend(400, { error: "Missing: Password" });
  }
  const user = await AppContext.getUsers().getByName(req.body.name);
  if (!user) {
    res.status(204).json({ error: "User not found" });
  } else if (await user.checkPassword(req.body.password)) {
    res
      .status(201)
      .json({ success: true, token: await Auth.generateJWT(user) });
  } else {
    res.status(403).json({ error: "Authentication Failed" });
  }
});

ERW.route(userApi, "post", "/", async (req, res, next, stopAndSend) => {
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
  newUser.name = req.body.name;
  await newUser.setPassword(req.body.password);
  await AppContext.getUsers().add(newUser);
  res.status(201).json({});
});
