import { Router } from 'express';
import { Logger } from './logger';

const logger = new Logger('ExpressRouterWrapper');

export class ExpressRouterWrapper {
  //
  public static route(
    router: Router,
    method: string,
    path: string,
    handler: any
  ): void {
    (router as any)[method](path, (req, res, next) => {
      let code = 500;
      let response = {
        error_code: 'SERVER_ERROR',
        error_message: 'unexpected error',
      };
      const stopAndSend = (httpCode: number, httpResponse: any) => {
        code = httpCode;
        response = httpResponse;
        throw new Error(JSON.stringify(httpResponse));
      };
      Promise.resolve()
        .then(async () => {
          await handler(req, res, next, stopAndSend);
          next();
        })
        .catch((error) => {
          logger.error(error);
          res.status(code).json(response);
        });
    });
  }
}
