import * as path from "path";
import { Logger } from "../utils-std-ts/logger";
import { FastifyInstance } from "fastify";
import { Auth } from "../data/auth";
import { AppContext } from "../appContext";

const logger = new Logger(path.basename(__filename));

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  fastify.get("/", async (req, res) => {
    logger.debug(`[${req.method}] ${req.url}`);
    await Auth.mustBeAuthenticated(req, res);
    const agents = await AppContext.getAgents().list();
    res.status(200).send({
      agents,
    });
  });

  fastify.get("/tags", async (req, res) => {
    logger.debug(`[${req.method}] ${req.url}`);
    await Auth.mustBeAuthenticated(req, res);
    const agents = await AppContext.getAgents().list();
    const tags = [];
    for (const agent of agents) {
      for (const tag of agent.tags) {
        if (tags.indexOf(tag) < 0) {
          tags.push(tag);
        }
      }
    }
    res.status(200).send(tags);
  });
}

module.exports = routes;
