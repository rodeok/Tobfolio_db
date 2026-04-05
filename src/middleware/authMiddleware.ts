import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
        landlordId?: string;
        adminPrivilege: boolean;
        name?: string;
    };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
        
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = {
            userId: decoded.userId,
            role: user.role,
            landlordId: user.landlordId?.toString(),
            adminPrivilege: user.adminPrivilege,
            name: user.name
        };
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
