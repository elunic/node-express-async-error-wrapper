import { ErrorRequestHandler, RequestHandler } from 'express';
/**
 *
 * @param {function} fn An express middleware. Can be synchronous or asynchronous; .catch() will only be called if the return value has a .catch() method.
 * @returns {function}
 */
export declare function asyncErrorWrapper(fn: RequestHandler): RequestHandler;
export declare function asyncErrorWrapper(fn: ErrorRequestHandler): ErrorRequestHandler;
