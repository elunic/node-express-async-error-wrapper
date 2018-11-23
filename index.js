/**
 *
 * @param {function} fn An express middleware. Can be synchronous or asynchronous; .catch() will only be called if the return value has a .catch() method.
 * @returns {function}
 */
function asyncErrorWrapper(fn) {
    if (fn.length === 4) {
        return function asyncErrorWrapper(err, req, res, next) {
            var returnValue = fn(err, req, res, next);

            if (returnValue && returnValue.catch && typeof returnValue.catch === 'function') {
                returnValue.catch(next);
            }
        }
    } else {
        return function asyncErrorWrapper(req, res, next) {
            var returnValue = fn(req, res, next);

            if (returnValue && returnValue.catch && typeof returnValue.catch === 'function') {
                returnValue.catch(next);
            }
        }
    }
}

module.exports.asyncErrorWrapper = asyncErrorWrapper;
// Backwards compatibility
module.exports = asyncErrorWrapper;
