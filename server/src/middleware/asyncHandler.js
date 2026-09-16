const logger = require('../utils/logger');

// Wraps async route handlers so errors are forwarded to the global error handler
// instead of crashing the process or hanging the request.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
