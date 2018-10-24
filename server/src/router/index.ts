import * as bodyParser from 'body-parser';
import * as express from 'express';
import { agentsApi } from './agents';

export const router = express.Router();
router.use(bodyParser.json());

router.use('/agents', agentsApi);
