import { NextFunction, Request, Response, Router } from 'express';
import { ExpressWrapper } from './utils/express-wrapper';

export const exampleGetRouter = ExpressWrapper.createRouter();

exampleGetRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send({});
  next();
});
