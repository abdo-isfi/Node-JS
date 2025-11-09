const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        code: statusCode,
        timestamp: new Date().toISOString(),
    });
};

module.exports = errorHandler;
