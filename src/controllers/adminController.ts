import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Reward from '../models/Reward.js';
import Redemption from '../models/Redemption.js';

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

export const toggleUserSuspend = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ message: `User ${user.isActive ? 'unsuspended' : 'suspended'} successfully`, user });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling user suspend status' });
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

// ─── Reward Management (Admin) ───────────────────────────────────────────────

export const createReward = async (req: Request, res: Response) => {
    try {
        const { name, description, imageUrl, pointsRequired } = req.body;
        const reward = new Reward({ name, description, imageUrl, pointsRequired });
        await reward.save();
        res.status(201).json(reward);
    } catch (error) {
        console.error('Create reward error:', error);
        res.status(500).json({ message: 'Error creating reward' });
    }
};

export const updateReward = async (req: Request, res: Response) => {
    try {
        const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reward) return res.status(404).json({ message: 'Reward not found' });
        res.json(reward);
    } catch (error) {
        res.status(500).json({ message: 'Error updating reward' });
    }
};

export const deleteReward = async (req: Request, res: Response) => {
    try {
        const reward = await Reward.findByIdAndDelete(req.params.id);
        if (!reward) return res.status(404).json({ message: 'Reward not found' });
        res.json({ message: 'Reward deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reward' });
    }
};

export const getAllRewards = async (req: Request, res: Response) => {
    try {
        const rewards = await Reward.find().sort({ createdAt: -1 });
        res.json(rewards);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rewards' });
    }
};

export const getRedemptions = async (req: Request, res: Response) => {
    try {
        const redemptions = await Redemption.find()
            .populate('userId', 'name email')
            .populate('rewardId', 'name imageUrl')
            .sort({ createdAt: -1 });
        res.json(redemptions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching redemptions' });
    }
};

export const fulfillRedemption = async (req: Request, res: Response) => {
    try {
        const redemption = await Redemption.findById(req.params.id);
        if (!redemption) return res.status(404).json({ message: 'Redemption not found' });
        if (redemption.status !== 'pending') {
            return res.status(400).json({ message: `Redemption is already ${redemption.status}` });
        }
        redemption.status = 'fulfilled';
        await redemption.save();
        res.json({ message: 'Redemption marked as fulfilled', redemption });
    } catch (error) {
        res.status(500).json({ message: 'Error fulfilling redemption' });
    }
};
