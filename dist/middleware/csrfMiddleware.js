"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfMiddleware = void 0;
const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const ALLOWED_ORIGINS = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://tobfolio-db-1.onrender.com',
].filter(Boolean);
const csrfMiddleware = (req, res, next) => {
    if (!MUTATING_METHODS.includes(req.method))
        return next();
    const origin = req.headers['origin'] || req.headers['referer'];
    if (!origin || !ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))) {
        return res.status(403).json({ message: 'Forbidden: invalid request origin' });
    }
    next();
};
exports.csrfMiddleware = csrfMiddleware;
