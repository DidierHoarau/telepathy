import { NextFunction, Request, Response, Router } from 'express';
import { ExpressWrapper } from './utils/express-wrapper';

export const examplePostRouter = ExpressWrapper.createRouter();

examplePostRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  res.status(201).send({});
  next();
});
