import * as _ from "lodash";
import * as path from "path";
import { Logger } from "../utils-std-ts/logger";
import { FastifyInstance, FastifyRequest, RequestGenericInterface } from "fastify";
import { Auth } from "../data/auth";
import { AppContext } from "../appContext";
import { TaskExecution } from "../common-model/taskExecution";

const logger = new Logger(path.basename(__filename));

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  interface GetTaskExecutions extends RequestGenericInterface {
    Params: {
      taskId: string;
    };
  }
  fastify.get<GetTaskExecutions>("/", async (req, res) => {
    logger.debug(`[${req.method}] ${req.url}`);
    await Auth.mustBeAuthenticated(req, res);
    AppContext.getTaskExecutions();
    const tasksExecutions = await AppContext.getTaskExecutions().list();
    const output: TaskExecution[] = [];
    for (const tasksExecution of tasksExecutions) {
      if (tasksExecution.taskId === req.params.taskId) {
        output.push(tasksExecution);
      }
    }
    const outputSorted = _.reverse(_.sortBy(output, "dateQueued"));
    res.status(200).send({ task_executions: outputSorted });
  });

  interface PostTaskExecutions extends RequestGenericInterface {
    Params: {
      taskId: string;
    };
  }
  fastify.post<PostTaskExecutions>("/", async (req, res) => {
    logger.info(`[${req.method}] ${req.url}`);
    AppContext.getTaskExecutions();
    const newTaskExecution = await AppContext.getTaskExecutions().createFromTaskId(req.params.taskId);
    res.status(201).send(newTaskExecution.toJson());
  });
}

module.exports = routes;
