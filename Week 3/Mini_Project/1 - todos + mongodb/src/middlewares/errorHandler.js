const createHttpError = require('http-errors');

const errorHandler = (err, req, res, next) => {
    // Check if the error is an instance of HttpError
    if (createHttpError.isHttpError(err)) {
        const statusCode = err.statusCode;
        res.status(statusCode).json({
            status: 'error',
            message: err.message,
            code: statusCode,
            timestamp: new Date().toISOString(),
        });
    } else {
        // Default to 500 Internal Server Error for unhandled errors
        console.error(err); // Log the full error for debugging
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            code: 500,
            timestamp: new Date().toISOString(),
        });
    }
};

module.exports = errorHandler;
