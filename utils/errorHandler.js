/**
 * Custom error handling utilities
 */

// Custom error class with HTTP status code
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error details
  console.error('ERROR 💥', {
    name: err.name,
    statusCode: err.statusCode,
    message: err.message,
    stack: err.stack
  });

  // For API requests
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }

  // For rendered website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Error',
      message: err.message,
      status: err.statusCode
    });
  }

  // For unknown errors in production
  console.error('UNKNOWN ERROR 💥', err);
  res.status(500).render('error', {
    title: 'Error',
    message: 'Something went wrong!',
    status: 500
  });
};

// 404 Not Found error handler
const notFound = (req, res, next) => {
  const err = new AppError(`Cannot find ${req.originalUrl} on this server!`, 404);
  next(err);
};

// Database error handler
const handleDatabaseError = (err) => {
  // Duplicate key error
  if (err.code === '23505') {
    return new AppError('A record with this information already exists.', 400);
  }
  
  // Foreign key constraint error
  if (err.code === '23503') {
    return new AppError('This operation would violate database constraints.', 400);
  }
  
  // Default database error
  return new AppError('Database error. Please try again later.', 500);
};

// Async function error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  globalErrorHandler,
  notFound,
  handleDatabaseError,
  catchAsync
};