const AppError = require("../utils/AppError");

const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if (token === "1234") {
        next();
    } else {
        next(new AppError("Token invalide", 401));
    }
};

module.exports = auth;
