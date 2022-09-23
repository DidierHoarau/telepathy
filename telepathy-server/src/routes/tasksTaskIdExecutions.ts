import * as _ from "lodash";
import { FastifyInstance, RequestGenericInterface } from "fastify";
import { Auth } from "../data/auth";
import { AppContext } from "../appContext";
import { TaskExecution } from "../common-model/taskExecution";
import { TaskExecutionStatus } from "../common-model/taskExecutionStatus";
import { StandardTracer } from "../utils-std-ts/standardTracer";

async function routes(fastify: FastifyInstance): Promise<void> {
  //
  interface GetTaskExecutions extends RequestGenericInterface {
    Params: {
      taskId: string;
    };
  }
  fastify.get<GetTaskExecutions>("/", async (req, res) => {
    await Auth.mustBeAuthenticated(req, res);
    const tasksExecutions = await AppContext.getTaskExecutions().list(StandardTracer.getSpanFromRequest(req));
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
    const taskExecutionAlreadyQueued = _.filter(
      await AppContext.getTaskExecutions().list(StandardTracer.getSpanFromRequest(req)),
      {
        status: TaskExecutionStatus.queued,
        taskId: req.params.taskId,
      }
    );
    if (taskExecutionAlreadyQueued.length > 0) {
      res.status(400).send({ Error: "Execution already queued" });
      return;
    }
    const newTaskExecution = await AppContext.getTaskExecutions().createFromTaskId(
      StandardTracer.getSpanFromRequest(req),
      req.params.taskId
    );
    res.status(201).send(newTaskExecution.toJson());
  });
}

module.exports = routes;
