import * as bodyParser from 'body-parser';
import * as express from 'express';
import { agentApi } from './agentapi';
import { taskApi } from './taskapi';

export const router = express.Router();
router.use(bodyParser.json());

router.use('/agents', agentApi);
router.use('/tasks', taskApi);
