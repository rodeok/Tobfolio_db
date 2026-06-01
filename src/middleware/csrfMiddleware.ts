import { Request, Response, NextFunction } from 'express';

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

const ALLOWED_ORIGINS = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://tobfolio-db-1.onrender.com',
].filter(Boolean) as string[];

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!MUTATING_METHODS.includes(req.method)) return next();

    const origin = req.headers['origin'] || req.headers['referer'];

    if (!origin || !ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))) {
        return res.status(403).json({ message: 'Forbidden: invalid request origin' });
    }

    next();
};
