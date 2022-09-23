import { FastifyInstance } from "fastify";
import { Auth } from "../data/auth";
import { AppContext } from "../appContext";
import { StandardTracer } from "../utils-std-ts/standardTracer";

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  fastify.get("/", async (req, res) => {
    await Auth.mustBeAuthenticated(req, res);
    const agents = await AppContext.getAgents().list(StandardTracer.getSpanFromRequest(req));
    res.status(200).send({
      agents,
    });
  });

  fastify.get("/tags", async (req, res) => {
    const agents = await AppContext.getAgents().list(StandardTracer.getSpanFromRequest(req));
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
