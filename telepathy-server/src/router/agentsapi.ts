import * as express from 'express';
import * as _ from 'lodash';
import { Agent } from '../agents/agent';
import { AppContext } from '../appcontext';
import { ExpressRouterWrapper as ERW } from '../utils-std-ts/express-router-wrapper';
import { Logger } from '../utils-std-ts/logger';

const logger = new Logger('router/agents');

export const agentsApi = express.Router();

ERW.route(agentsApi, 'post', '/', async (req, res, next, stopAndSend) => {
  if (!_.has(req, 'body.agent_id') || !_.has(req, 'body.agent_id')) {
    stopAndSend(400, { agent_registered: false, error: 'ERROR_PARAM_MISSING_AGENT_ID' });
  }

  await AppContext.getAgentRegistration().register(new Agent(req.body.agent_id));

  res.status(201).json({ agent_registered: true });
});
