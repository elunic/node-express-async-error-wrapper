import { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';

exports = module.exports = asyncErrorWrapper;

/**
 *
 * @param {function} fn An express middleware. Can be synchronous or asynchronous; .catch() will only be called if the return value has a .catch() method.
 * @returns {function}
 */
function asyncErrorWrapper(fn: RequestHandler): RequestHandler;
function asyncErrorWrapper(fn: ErrorRequestHandler): ErrorRequestHandler;
function asyncErrorWrapper(fn: RequestHandler | ErrorRequestHandler) {
  if (fn.length === 4) {
    // tslint:disable-next-line:no-any (errors can be of any type)
    return function asyncErrorWrapper(err: any, req: Request, res: Response, next: NextFunction) {
      const returnValue = (fn as ErrorRequestHandler)(err, req, res, next);

      if (returnValue && returnValue.catch && typeof returnValue.catch === 'function') {
        returnValue.catch(next);
      } else {
        return returnValue;
      }
    };
  } else {
    return function asyncErrorWrapper(req: Request, res: Response, next: NextFunction) {
      const returnValue = (fn as RequestHandler)(req, res, next);

      if (returnValue && returnValue.catch && typeof returnValue.catch === 'function') {
        returnValue.catch(next);
      } else {
        return returnValue;
      }
    };
  }
}

// Backwards compatibility
export default asyncErrorWrapper;

// TS compatibility
export { asyncErrorWrapper };
