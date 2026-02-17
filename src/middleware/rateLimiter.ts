import rateLimit from 'express-rate-limit';
import MongoStore from 'rate-limit-mongo';
import { Request, Response } from 'express';

const MONGODB_URI = process.env.MONGODB_URI || '';

// General limiter for all routes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new MongoStore({
        uri: MONGODB_URI,
        collectionName: 'rateLimits',
        expireTimeMs: 15 * 60 * 1000,
        errorHandler: console.error.bind(null, 'rate-limit-mongo error:'),
    }),
    keyGenerator: (req: Request) => {
        // Use user ID if authenticated, otherwise request IP
        if ((req as any).user && (req as any).user.id) {
            return (req as any).user.id;
        }
        return req['ip'] || 'unknown-ip'; // Fallback for IP
    },
    validate: {
        ip: false,
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.',
        });
    },
});

// Stricter limiter for sensitive routes (e.g., login, signup)
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 requests per hour for auth routes
    standardHeaders: true,
    legacyHeaders: false,
    store: new MongoStore({
        uri: MONGODB_URI,
        collectionName: 'authRateLimits',
        expireTimeMs: 60 * 60 * 1000,
        errorHandler: console.error.bind(null, 'rate-limit-mongo error:'),
    }),
    keyGenerator: (req: Request) => {
        // Use user ID if authenticated, otherwise request IP
        if ((req as any).user && (req as any).user.id) {
            return (req as any).user.id;
        }
        return req['ip'] || 'unknown-ip';
    },
    validate: {
        ip: false,
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts, please try again later.',
        });
    },
});
