class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isHttpError = true; // Custom property to identify HttpError instances
    }
}

module.exports = HttpError;
