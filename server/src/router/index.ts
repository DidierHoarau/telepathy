import { config } from '../config';
import { exampleGetRouter } from './example-get';
import { examplePostRouter } from './example-post';
import { ExpressWrapper } from './utils/express-wrapper';

export const router = ExpressWrapper.createRouter();

router.use(`${config.API_PATH}/example/`, exampleGetRouter);
router.use(`${config.API_PATH}/example/`, examplePostRouter);
