"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin only' });
        }
        req.admin = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
exports.adminMiddleware = adminMiddleware;
