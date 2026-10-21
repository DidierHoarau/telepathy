import { FastifyInstance, RequestGenericInterface } from "fastify";
import { UserPassword } from "../data/UserPassword";
import { Auth } from "../data/Auth";
import { User } from "../common-model/User";
import { UsersData } from "../data/UsersData";
import { OTelRequestSpan } from "../OTelContext";

let usersData: UsersData;

export class UserRoutes {
  //
  constructor(usersDataIn: UsersData) {
    usersData = usersDataIn;
  }

  public async getRoutes(fastify: FastifyInstance): Promise<void> {
    //
    fastify.get("/status/initialization", async (req, res) => {
      if ((await usersData.list(OTelRequestSpan(req))).length === 0) {
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
      if (!req.body.name) {
        return res.status(400).send({ error: "Missing: Name" });
      }
      if (!req.body.password) {
        return res.status(400).send({ error: "Missing: Password" });
      }
      const user = await usersData.getByName(OTelRequestSpan(req), req.body.name);
      if (!user) {
        return res.status(403).send({ error: "Authentication Failed" });
      } else if (await UserPassword.checkPassword(OTelRequestSpan(req), user, req.body.password)) {
        res.status(201).send({ success: true, token: await Auth.generateJWT(user) });
      } else {
        return res.status(403).send({ error: "Authentication Failed" });
      }
    });

    fastify.post("/session/refresh", async (req, res) => {
      const authorization = req.headers.authorization;
      if (!authorization) {
        return res.status(403).send({ error: "Access Denied" });
      }
      const session = await Auth.checkToken(authorization.split(" ")[1]);
      if (!session.authenticated) {
        return res.status(403).send({ error: "Access Denied" });
      }
      const user = await usersData.get(OTelRequestSpan(req), session.info.user_id);
      if (!user) {
        return res.status(403).send({ error: "Access Denied" });
      }
      res.status(201).send({ token: await Auth.generateJWT(user) });
    });

    fastify.get("/", async (req, res) => {
      await Auth.mustBeAuthenticated(req, res);
      const users = await usersData.list(OTelRequestSpan(req));
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
      let isInitialized = true;
      if ((await usersData.list(OTelRequestSpan(req))).length === 0) {
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
      if (await usersData.getByName(OTelRequestSpan(req), req.body.name)) {
        return res.status(400).send({ error: "Username Already Exists" });
      }
      newUser.name = req.body.name;
      await UserPassword.setPassword(OTelRequestSpan(req), newUser, req.body.password);
      await usersData.add(OTelRequestSpan(req), newUser);
      res.status(201).send({});
    });
  }
}
