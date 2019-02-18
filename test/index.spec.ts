import * as express from 'express';
import { Express, NextFunction, Request, Response } from 'express';
import getPort = require('get-port');
import { Server } from 'http';
import * as request from 'supertest';

import { asyncErrorWrapper } from '../src';

describe('express-async-error-wrapper', () => {
  let app: Express;
  let server: Server;
  let errorMw;

  describe('regular middleware wrapping', () => {
    beforeEach(async () => {
      app = express();

      app.get(
        '/ok',
        asyncErrorWrapper((req, res, next) => {
          res
            .status(200)
            .type('text')
            .send('OK');
        }),
      );

      app.get(
        '/sync-error',
        asyncErrorWrapper((req, res, next) => {
          throw new Error('Error 1');
        }),
      );

      app.get(
        '/async-error-next',
        asyncErrorWrapper((req, res, next) => {
          setTimeout(() => {
            next(new Error('Error 2'));
          }, 1);
        }),
      );

      app.get(
        '/async-error-promise',
        asyncErrorWrapper(async (req, res, next) => {
          throw new Error('Error 3');
        }),
      );

      // Don't propagate our test errors throught the process, just bring them into a form we can analyze.
      app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        return res.status(500).json({
          error: err.toString(),
        });
      });

      return new Promise(async (resolve, reject) => {
        try {
          server = app.listen(await getPort(), (err: unknown) => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        } catch (ex) {
          reject(ex);
        }
      });
    });

    it('should allow for returning values in sync functions', () => {
      expect(
        asyncErrorWrapper((req, res, next) => {
          return 'foo';
          // @ts-ignore (allow passing null for test purposes)
        })(null, null, null),
      ).toEqual('foo');
    });

    it('should not return values from async functions', () => {
      expect(
        asyncErrorWrapper(async (req, res, next) => {
          return 'foo';
          // @ts-ignore (allow passing null for test purposes)
        })(null, null, null),
      ).toBeUndefined();
    });

    it('should not return an error when no error is thrown', done => {
      request(app)
        .get('/ok')
        .expect(200, 'OK')
        .expect('Content-Type', 'text/plain; charset=utf-8', done);
    });

    it('should work with non-async functions', done => {
      request(app)
        .get('/sync-error')
        .expect(500, {
          error: 'Error: Error 1',
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should work correctly with an async function that passes its error to next()', done => {
      request(app)
        .get('/async-error-next')
        .expect(500, {
          error: 'Error: Error 2',
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should work correctly with a true async function', done => {
      request(app)
        .get('/async-error-promise')
        .expect(500, {
          error: 'Error: Error 3',
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    afterEach(async () => {
      return new Promise((resolve, reject) => {
        server.close((err: unknown) => {
          if (err) {
            return reject(err);
          }

          errorMw = undefined;

          resolve();
        });
      });
    });
  });

  describe('error middleware wrapping', () => {
    beforeEach(async () => {
      app = express();

      app.get(
        '/ok',
        asyncErrorWrapper((req, res, next) => {
          res
            .status(200)
            .type('text')
            .send('OK');
        }),
      );

      app.get(
        '/sync-error',
        asyncErrorWrapper((req, res, next) => {
          throw new Error('Error 1');
        }),
      );

      app.get(
        '/async-error-next',
        asyncErrorWrapper((req, res, next) => {
          setTimeout(() => {
            next(new Error('Error 2'));
          }, 1);
        }),
      );

      app.get(
        '/async-error-promise',
        asyncErrorWrapper(async (req, res, next) => {
          throw new Error('Error 3');
        }),
      );

      app.use(
        asyncErrorWrapper(async (err: Error, req: Request, res: Response, next: NextFunction) => {
          throw new Error('Error handler error: ' + err.toString());
        }),
      );

      // Don't propagate our test errors throught the process, just bring them into a form we can analyze.
      app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        return res.status(500).json({
          error: err.toString(),
        });
      });

      return new Promise(async (resolve, reject) => {
        try {
          server = app.listen(await getPort(), (err: unknown) => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        } catch (ex) {
          reject(ex);
        }
      });
    });

    it('should allow for returning values in sync functions', () => {
      expect(
        asyncErrorWrapper((err: Error, req: Request, res: Response, next: NextFunction) => {
          return 'foo';
          // @ts-ignore (allow passing null for test purposes)
        })(null, null, null, null),
      ).toEqual('foo');
    });

    it('should not return values from async functions', () => {
      expect(
        asyncErrorWrapper(async (err: Error, req: Request, res: Response, next: NextFunction) => {
          return 'foo';
          // @ts-ignore (allow passing null for test purposes)
        })(null, null, null, null),
      ).toBeUndefined();
    });

    it('should not return an error when no error is thrown', done => {
      request(app)
        .get('/ok')
        .expect(200, 'OK')
        .expect('Content-Type', 'text/plain; charset=utf-8', done);
    });

    it('should work with non-async functions', done => {
      request(app)
        .get('/sync-error')
        .expect(500, {
          error: 'Error: Error handler error: Error: Error 1',
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should work correctly with an async function that passes its error to next()', done => {
      request(app)
        .get('/async-error-next')
        .expect(500, {
          error: 'Error: Error handler error: Error: Error 2',
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    it('should work correctly with a true async function', done => {
      request(app)
        .get('/async-error-promise')
        .expect(500, {
          error: 'Error: Error handler error: Error: Error 3',
        })
        .expect('Content-Type', 'application/json; charset=utf-8', done);
    });

    afterEach(async () => {
      return new Promise((resolve, reject) => {
        server.close((err: unknown) => {
          if (err) {
            return reject(err);
          }

          errorMw = undefined;

          resolve();
        });
      });
    });
  });
});
