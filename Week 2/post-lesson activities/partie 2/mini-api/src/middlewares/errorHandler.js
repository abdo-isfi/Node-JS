const AppError = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message || 'Something went wrong!';

  let error = { ...err };
  error.message = err.message;

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      code: error.statusCode,
      timestamp: error.timestamp,
    });
  } else {
    // For unexpected errors, send a generic error response
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
      code: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = errorHandler;
