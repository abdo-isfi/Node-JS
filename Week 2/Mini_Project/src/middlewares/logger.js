const logger = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const end = process.hrtime(start);
        const durationMs = (end[0] * 1000) + (end[1] / 1000000);
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${durationMs.toFixed(3)}ms`);
    });

    next();
};

module.exports = logger;

