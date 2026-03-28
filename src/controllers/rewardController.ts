import { Request, Response } from 'express';
import Reward from '../models/Reward.js';
import Redemption from '../models/Redemption.js';
import User from '../models/User.js';

interface AuthRequest extends Request {
    user?: { userId: string };
}

/**
 * GET /api/v1/rewards
 * Browse all active rewards (for landlords)
 */
export const getRewards = async (req: Request, res: Response) => {
    try {
        const rewards = await Reward.find({ isActive: true }).sort({ pointsRequired: 1 });
        res.json(rewards);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rewards' });
    }
};

/**
 * GET /api/v1/rewards/me
 * Get the logged-in landlord's referral code and current points
 */
export const getMyReferralInfo = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.userId).select('name referralCode referralPoints referredBy');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            referralCode: user.referralCode,
            referralPoints: user.referralPoints,
            referralLink: `https://www.tobfolio.com/register?ref=${user.referralCode}`,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching referral info' });
    }
};

/**
 * POST /api/v1/rewards/:id/redeem
 * Redeem a reward using accumulated points
 */
export const redeemReward = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const rewardId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const reward = await Reward.findById(rewardId);
        if (!reward || !reward.isActive) {
            return res.status(404).json({ message: 'Reward not found or no longer available' });
        }

        if (user.referralPoints < reward.pointsRequired) {
            return res.status(400).json({
                message: `Insufficient points. You have ${user.referralPoints} pts but need ${reward.pointsRequired} pts.`,
            });
        }

        // Deduct points
        user.referralPoints -= reward.pointsRequired;
        await user.save();

        // Record redemption
        const redemption = new Redemption({
            userId: user._id,
            rewardId: reward._id,
            pointsSpent: reward.pointsRequired,
            status: 'pending',
        });
        await redemption.save();

        res.status(201).json({
            message: 'Redemption successful! We will process your reward shortly.',
            remainingPoints: user.referralPoints,
            redemption,
        });
    } catch (error) {
        console.error('Redeem error:', error);
        res.status(500).json({ message: 'Error processing redemption' });
    }
};
