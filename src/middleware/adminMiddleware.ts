import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AdminRequest extends Request {
    admin?: {
        username: string;
        role: string;
    };
}

export const adminMiddleware = (req: AdminRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { username: string, role: string };

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin only' });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
