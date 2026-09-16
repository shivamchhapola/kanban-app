const logger = require('../utils/logger');

// Global error handler — must have 4 params for Express to treat it as an error handler
const errorHandler = (err, req, res, next) => {
  // Log all errors
  logger.error(`${err.message} — ${req.method} ${req.originalUrl}`, { stack: err.stack });

  // Prisma-specific errors
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Foreign key constraint violation' });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Duplicate record' });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Internal server error';

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
