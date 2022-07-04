import * as _ from "lodash";
import * as path from "path";
import { Logger } from "../utils-std-ts/logger";
import { FastifyInstance, FastifyRequest, RequestGenericInterface } from "fastify";
import { UserPassword } from "../data/userPassword";
import { AppContext } from "../appContext";
import { Auth } from "../data/auth";
import { User } from "../common-model/user";

const logger = new Logger(path.basename(__filename));

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  fastify.get("/status/initialization", async (req, res) => {
    logger.debug(`[${req.method}] ${req.url}`);
    if ((await AppContext.getUsers().list()).length === 0) {
      res.status(201).send({ initialized: false });
    } else {
      res.status(201).send({ initialized: true });
    }
  });

  interface PostSession extends RequestGenericInterface {
    Body: {
      name: string;
      password: string;
    };
  }
  fastify.post<PostSession>("/session", async (req, res) => {
    logger.info(`[${req.method}] ${req.url}`);
    if (!req.body.name) {
      return res.status(400).send({ error: "Missing: Name" });
    }
    if (!req.body.password) {
      return res.status(400).send({ error: "Missing: Password" });
    }
    const user = await AppContext.getUsers().getByName(req.body.name);
    if (!user) {
      return res.status(403).send({ error: "Authentication Failed" });
    } else if (await UserPassword.checkPassword(user, req.body.password)) {
      res.status(201).send({ success: true, token: await Auth.generateJWT(user) });
    } else {
      return res.status(403).send({ error: "Authentication Failed" });
    }
  });

  fastify.get("/", async (req, res) => {
    logger.debug(`[${req.method}] ${req.url}`);
    await Auth.mustBeAuthenticated(req, res);
    const users = await AppContext.getUsers().list();
    for (const user of users) {
      delete user.passwordEncrypted;
    }
    res.status(201).send({ users });
  });

  interface PostUser extends RequestGenericInterface {
    Body: {
      name: string;
      password: string;
    };
  }
  fastify.post<PostUser>("/", async (req, res) => {
    logger.info(`[${req.method}] ${req.url}`);
    let isInitialized = true;
    if ((await AppContext.getUsers().list()).length === 0) {
      isInitialized = false;
    }
    const userSession = await Auth.getUserSession(req);
    if (isInitialized && !userSession.isAuthenticated) {
      return res.status(403).send({ error: "Access Denied" });
    }
    const newUser = new User();
    if (!req.body.name) {
      return res.status(400).send({ error: "Missing: Name" });
    }
    if (!req.body.password) {
      return res.status(400).send({ error: "Missing: Password" });
    }
    if (await AppContext.getUsers().getByName(req.body.name)) {
      return res.status(400).send({ error: "Username Already Exists" });
    }
    newUser.name = req.body.name;
    await UserPassword.setPassword(newUser, req.body.password);
    await AppContext.getUsers().add(newUser);
    res.status(201).send({});
  });
}

module.exports = routes;
