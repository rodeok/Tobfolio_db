import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '@/models/User.js';

export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        // Check admin credentials from environment variables
        if (
            username === process.env.ADMIN_USERNAME &&
            password === process.env.ADMIN_PASSWORD
        ) {
            const token = jwt.sign(
                { username, role: 'admin' },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '24h' }
            );

            return res.json({ token, message: 'Admin login successful' });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export const toggleUserBan = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isBanned = !user.isBanned;
        await user.save();

        res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, user });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling user ban status' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};
