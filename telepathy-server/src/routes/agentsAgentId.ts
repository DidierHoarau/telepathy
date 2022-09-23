import * as _ from "lodash";
import { FastifyInstance, RequestGenericInterface } from "fastify";
import { AppContext } from "../appContext";
import { Auth } from "../data/auth";
import { Agent } from "../common-model/agent";
import { User } from "../common-model/user";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { StandardTracer } from "../utils-std-ts/standardTracer";

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  interface PostSession extends RequestGenericInterface {
    Body: {
      key: string;
      tags: string[];
    };
    Params: {
      agentId: string;
    };
  }
  fastify.post<PostSession>("/session", async (req, res) => {
    if (!req.body.key) {
      return res.status(400).send({ error: "Missing: Key" });
    } else if (req.body.key !== AppContext.getConfig().AGENT_KEY) {
      return res.status(403).send({ error: "Access Denied" });
    } else {
      const agent = new Agent(req.params.agentId);
      if (req.body.tags) {
        agent.tags = req.body.tags;
      }
      await AppContext.getAgents().register(StandardTracer.getSpanFromRequest(req), agent);
      const userAgent = new User();
      userAgent.name = req.params.agentId;
      res.status(201).send({ success: true, token: await Auth.generateJWT(userAgent) });
    }
  });

  interface GetTaskExecutions extends RequestGenericInterface {
    Params: {
      agentId: string;
    };
  }
  fastify.get<GetTaskExecutions>("/tasks/executions", async (req, res) => {
    await Auth.mustBeAuthenticated(req, res);
    const taskExecutionsQueued = _.filter(
      await AppContext.getTaskExecutions().list(StandardTracer.getSpanFromRequest(req)),
      {
        status: TaskExecutionStatus.queued,
      }
    );
    const agent = await AppContext.getAgents().get(StandardTracer.getSpanFromRequest(req), req.params.agentId);
    const taskExecutionCompatible = [];
    for (const taskExecution of taskExecutionsQueued) {
      if (!taskExecution.tag || agent.tags.indexOf(taskExecution.tag) >= 0) {
        taskExecutionCompatible.push(taskExecution);
      }
    }
    res.status(201).send({
      agent_registered: true,
      task_executions: taskExecutionCompatible,
    });
  });
}

module.exports = routes;
