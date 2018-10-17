/* Params:
{
  url: string
  auth: {
    pass: string,
    user: string
  },
  headers: any
  json: true (for get)
  json: any (for post/put)
}
*/

import * as fse from 'fs-extra';
import * as _ from 'lodash';
import * as request from 'request';

const defaultParams = { timeout: 10000 };

export class HttpTools {
  public static get(userParams: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!_.has(userParams, 'url')) {
        throw new Error('url parameter missing');
      }
      const params = _.merge(userParams, defaultParams);
      request.get(params, (error, response, body) => {
        if (!error && response.statusCode && response.statusCode < 300) {
          resolve(body);
        } else {
          reject(error || new Error(body));
        }
      });
    });
  }

  public static put(userParams: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = _.merge(userParams, defaultParams);
      request.put(params, (error, response, body) => {
        if (!error && response.statusCode < 300) {
          resolve(body);
        } else {
          reject(error || new Error(body));
        }
      });
    });
  }

  public static post(userParams: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = _.merge(userParams, defaultParams);
      request.post(params, (error, response, body) => {
        if (!error && response.statusCode < 300) {
          resolve(body);
        } else {
          reject(error || new Error(body));
        }
      });
    });
  }

  public static delete(userParams: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = _.merge(userParams, defaultParams);
      request.delete(params, (error, response, body) => {
        if (!error && response.statusCode < 300) {
          resolve(body);
        } else {
          reject(error || new Error(body));
        }
      });
    });
  }

  public static uploadFile(filepath: string, url: string, fieldName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const req = request.post(url, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          resolve(resp);
        }
      });
      const form = req.form();
      form.append(fieldName, fse.createReadStream(filepath), {
        contentType: 'text/plain',
        filename: filepath
      });
    });
  }
}
