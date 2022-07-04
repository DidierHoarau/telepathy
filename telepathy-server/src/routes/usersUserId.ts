import * as _ from "lodash";
import * as path from "path";
import { Logger } from "../utils-std-ts/logger";
import { FastifyInstance, FastifyRequest, RequestGenericInterface } from "fastify";
import { Auth } from "../data/auth";
import { AppContext } from "../appContext";
import { UserPassword } from "../data/userPassword";
import { User } from "../common-model/user";

const logger = new Logger(path.basename(__filename));

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  interface GetUserRequest extends RequestGenericInterface {
    Params: {
      userId: string;
    };
  }
  fastify.get<GetUserRequest>("/", async (req, res) => {
    logger.debug(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    const user = await AppContext.getUsers().get(req.params.userId);
    if (!user) {
      return res.status(404).send({ error: "Not Found" });
    }
    delete user.passwordEncrypted;
    res.status(201).send(user);
  });

  interface PutUserRequest extends RequestGenericInterface {
    Params: {
      userId: string;
    };
    Body: {
      name: string;
      password: string;
    };
  }
  fastify.put<PutUserRequest>("/", async (req, res) => {
    logger.info(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    const user = await AppContext.getUsers().get(req.params.userId);
    if (!user) {
      return res.status(404).send({ error: "Not Found" });
    }
    const userUpddate = new User();
    if (!req.body.name) {
      return res.status(400).send({ error: "Missing: Name" });
    }
    userUpddate.name = req.body.name;
    if (req.body.password) {
      await UserPassword.setPassword(userUpddate, req.body.password);
    }
    await AppContext.getUsers().update(user.id, userUpddate);
    res.status(201).send({});
  });

  interface DeleteUserRequest extends RequestGenericInterface {
    Params: {
      userId: string;
    };
  }
  fastify.delete<DeleteUserRequest>("/", async (req, res) => {
    logger.info(`[${req.method}] ${req.url}`);
    Auth.mustBeAuthenticated(req, res);
    const user = await AppContext.getUsers().get(req.params.userId);
    if (!user) {
      return res.status(404).send({ error: "Not Found" });
    }
    await AppContext.getUsers().delete(user.id);
    res.status(201).send({});
  });
}

module.exports = routes;
