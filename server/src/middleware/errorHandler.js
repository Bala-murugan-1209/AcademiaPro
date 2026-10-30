export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `A record with this ${field} "${value}" already exists.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(statusCode).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  // MongoDB Atlas IP Whitelist / SSL Alert 80 errors
  if (
    err.message &&
    (err.message.includes('SSL alert number 80') ||
      err.message.includes('ssl3_read_bytes') ||
      err.message.includes('tlsv1 alert internal error') ||
      err.message.includes('IP that isn\'t whitelisted') ||
      err.message.includes('ECONNREFUSED'))
  ) {
    statusCode = 503;
    message =
      'MongoDB Atlas Connection Blocked: Your current IP address is not whitelisted. In MongoDB Atlas, go to "Security" > "Network Access", click "+ Add IP Address", select "Allow Access from Anywhere" (0.0.0.0/0), and confirm.';
  }

  // Don't leak raw internal details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong. Please try again later.';
  }

  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
