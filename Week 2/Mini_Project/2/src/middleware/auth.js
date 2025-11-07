require('dotenv').config();
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');

exports.authenticate = asyncHandler((req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        throw new HttpError(401, 'Access Denied: No Token Provided!');
    }

    if (token === process.env.API_TOKEN) {
        req.user = { id: '1', role: 'admin' }; // Assuming admin role for valid API_TOKEN
        next();
    } else {
        throw new HttpError(403, 'Invalid Token');
    }
});

exports.authorize = (role) => {
    return asyncHandler((req, res, next) => {
        if (!req.user || req.user.role !== role) {
            throw new HttpError(403, 'Access Denied: You do not have the correct role.');
        }
        next();
    });
};
