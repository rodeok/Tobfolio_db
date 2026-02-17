"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_mongo_1 = __importDefault(require("rate-limit-mongo"));
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tobfolio';
// General limiter for most routes
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new rate_limit_mongo_1.default({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 15 * 60 * 1000,
        errorHandler: console.error.bind(null, 'rate-limit-mongo error:'),
    }),
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise request IP
        if (req.user && req.user.id) {
            return req.user.id;
        }
        return req['ip'] || 'unknown-ip'; // Fallback for IP
    },
    validate: {
        ip: false,
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.',
        });
    },
});
// Stricter limiter for sensitive routes (e.g., login, signup)
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 requests per hour for auth routes
    standardHeaders: true,
    legacyHeaders: false,
    store: new rate_limit_mongo_1.default({
        uri: MONGODB_URI,
        collectionName: 'authRateLimits',
        expireTimeMs: 60 * 60 * 1000,
        errorHandler: console.error.bind(null, 'rate-limit-mongo error:'),
    }),
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise request IP
        if (req.user && req.user.id) {
            return req.user.id;
        }
        return req['ip'] || 'unknown-ip';
    },
    validate: {
        ip: false,
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts, please try again later.',
        });
    },
});
