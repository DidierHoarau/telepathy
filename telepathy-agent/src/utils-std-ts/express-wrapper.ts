// Used to make it easier to create unit tests

import { Express, NextFunction, Request, Response, Router, RouterOptions } from 'express';
import * as express from 'express';

export class ExpressWrapper {
  //
  public static createApi(): Express {
    return express();
  }

  public static createRouter(params?: RouterOptions): Router {
    return Router(params);
  }
}
