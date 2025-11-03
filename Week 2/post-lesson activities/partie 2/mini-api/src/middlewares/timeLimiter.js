const AppError = require("../utils/AppError");

const timeLimiter = (req, res, next) => {
    const now = new Date();
    const hour = now.getHours();

    // Block requests between 10 PM (22) and 6 AM (6)
    if (hour >= 22 || hour < 6) {
        next(new AppError("Horaire interdit", 403));
    } else {
        next();
    }
};

module.exports = timeLimiter;
