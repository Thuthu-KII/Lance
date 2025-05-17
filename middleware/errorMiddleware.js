const logger = require('../config/logger');

module.exports = {
  notFound: (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  },

  errorHandler: (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    logger.error({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
      request: {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        body: req.body
      }
    });

    res.status(statusCode).json({
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  },

  asyncHandler: (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  }
};