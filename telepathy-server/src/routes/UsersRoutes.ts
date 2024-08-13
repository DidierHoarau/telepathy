import { FastifyInstance, RequestGenericInterface } from "fastify";
import { UserPassword } from "../data/UserPassword";
import { Auth } from "../data/Auth";
import { User } from "../common-model/User";
import { UsersData } from "../data/UsersData";
import { StandardTracerGetSpanFromRequest } from "../utils-std-ts/StandardTracer";

let usersData: UsersData;

export class UserRoutes {
  //
  constructor(usersDataIn: UsersData) {
    usersData = usersDataIn;
  }

  public async getRoutes(fastify: FastifyInstance): Promise<void> {
    //
    fastify.get("/status/initialization", async (req, res) => {
      if ((await usersData.list(StandardTracerGetSpanFromRequest(req))).length === 0) {
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
      const user = await usersData.getByName(StandardTracerGetSpanFromRequest(req), req.body.name);
      if (!user) {
        return res.status(403).send({ error: "Authentication Failed" });
      } else if (await UserPassword.checkPassword(StandardTracerGetSpanFromRequest(req), user, req.body.password)) {
        res.status(201).send({ success: true, token: await Auth.generateJWT(user) });
      } else {
        return res.status(403).send({ error: "Authentication Failed" });
      }
    });

    fastify.get("/", async (req, res) => {
      await Auth.mustBeAuthenticated(req, res);
      const users = await usersData.list(StandardTracerGetSpanFromRequest(req));
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
      if ((await usersData.list(StandardTracerGetSpanFromRequest(req))).length === 0) {
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
      if (await usersData.getByName(StandardTracerGetSpanFromRequest(req), req.body.name)) {
        return res.status(400).send({ error: "Username Already Exists" });
      }
      newUser.name = req.body.name;
      await UserPassword.setPassword(StandardTracerGetSpanFromRequest(req), newUser, req.body.password);
      await usersData.add(StandardTracerGetSpanFromRequest(req), newUser);
      res.status(201).send({});
    });
  }
}
