import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { Request } from 'express';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { name, phone, about, email } = req.body;
        const user = await User.findById(req.user?.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.about = about || user.about;

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                about: user.about
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const user = await User.findById(req.user?.userId);

        if (!user || !user.password) {
            return res.status(404).json({ message: 'User not found or invalid password state' });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.user?.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
