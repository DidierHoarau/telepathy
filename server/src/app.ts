import * as bodyParser from 'body-parser';
import { NextFunction, Request, Response, Router } from 'express';
import * as url from 'url';
import { config } from './config';
import { router } from './router';
import { ExpressWrapper } from './router/utils/express-wrapper';
import { Logger } from './utils/logger';

const LOGTAG = '[app]';

Logger.info(`${LOGTAG} ====== Starting seed-nodejs-typescript ======`);

const api = ExpressWrapper.createApi();
const PORT = 3000;

api.listen(PORT, () => {
  Logger.info(`${LOGTAG} App listening on port ${PORT}`);
});

api.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
  next();
});

api.use((req: any, res: Response, next: NextFunction) => {
  res.status(404);
  req.customApiLogging = { startDate: new Date() };
  Logger.info(`${LOGTAG} ${req.method} ${url.parse(req.url).pathname}`);
  next();
});

api.use(bodyParser.json());

api.use(router);

router.use((req: any, res: Response, next: NextFunction) => {
  Logger.info(
    `${LOGTAG} API Response: ${res.statusCode}; ${new Date().getTime() -
      req.customApiLogging.startDate.getTime()}ms`
  );
  next();
});
