"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redeemReward = exports.getMyReferralInfo = exports.getRewards = void 0;
const Reward_js_1 = __importDefault(require("../models/Reward.js"));
const Redemption_js_1 = __importDefault(require("../models/Redemption.js"));
const User_js_1 = __importDefault(require("../models/User.js"));
/**
 * GET /api/v1/rewards
 * Browse all active rewards (for landlords)
 */
const getRewards = async (req, res) => {
    try {
        const rewards = await Reward_js_1.default.find({ isActive: true }).sort({ pointsRequired: 1 });
        res.json(rewards);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching rewards' });
    }
};
exports.getRewards = getRewards;
/**
 * GET /api/v1/rewards/me
 * Get the logged-in landlord's referral code and current points
 */
const getMyReferralInfo = async (req, res) => {
    try {
        const user = await User_js_1.default.findById(req.user?.userId).select('name referralCode referralPoints referredBy');
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json({
            referralCode: user.referralCode,
            referralPoints: user.referralPoints,
            referralLink: `https://www.tobfolio.com/register?ref=${user.referralCode}`,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching referral info' });
    }
};
exports.getMyReferralInfo = getMyReferralInfo;
/**
 * POST /api/v1/rewards/:id/redeem
 * Redeem a reward using accumulated points
 */
const redeemReward = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const rewardId = req.params.id;
        const user = await User_js_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const reward = await Reward_js_1.default.findById(rewardId);
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
        const redemption = new Redemption_js_1.default({
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
    }
    catch (error) {
        console.error('Redeem error:', error);
        res.status(500).json({ message: 'Error processing redemption' });
    }
};
exports.redeemReward = redeemReward;
