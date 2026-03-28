"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fulfillRedemption = exports.getRedemptions = exports.getAllRewards = exports.deleteReward = exports.updateReward = exports.createReward = exports.deleteUser = exports.toggleUserSuspend = exports.toggleUserBan = exports.getAllUsers = exports.adminLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_js_1 = __importDefault(require("../models/User.js"));
const Reward_js_1 = __importDefault(require("../models/Reward.js"));
const Redemption_js_1 = __importDefault(require("../models/Redemption.js"));
const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        // Check admin credentials from environment variables
        if (username === process.env.ADMIN_USERNAME &&
            password === process.env.ADMIN_PASSWORD) {
            const token = jsonwebtoken_1.default.sign({ username, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
            return res.json({ token, message: 'Admin login successful' });
        }
        else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.adminLogin = adminLogin;
const getAllUsers = async (req, res) => {
    try {
        const users = await User_js_1.default.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};
exports.getAllUsers = getAllUsers;
const toggleUserBan = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User_js_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isBanned = !user.isBanned;
        await user.save();
        res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, user });
    }
    catch (error) {
        res.status(500).json({ message: 'Error toggling user ban status' });
    }
};
exports.toggleUserBan = toggleUserBan;
const toggleUserSuspend = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User_js_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isActive = !user.isActive;
        await user.save();
        res.json({ message: `User ${user.isActive ? 'unsuspended' : 'suspended'} successfully`, user });
    }
    catch (error) {
        res.status(500).json({ message: 'Error toggling user suspend status' });
    }
};
exports.toggleUserSuspend = toggleUserSuspend;
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User_js_1.default.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};
exports.deleteUser = deleteUser;
// ─── Reward Management (Admin) ───────────────────────────────────────────────
const createReward = async (req, res) => {
    try {
        const { name, description, imageUrl, pointsRequired } = req.body;
        const reward = new Reward_js_1.default({ name, description, imageUrl, pointsRequired });
        await reward.save();
        res.status(201).json(reward);
    }
    catch (error) {
        console.error('Create reward error:', error);
        res.status(500).json({ message: 'Error creating reward' });
    }
};
exports.createReward = createReward;
const updateReward = async (req, res) => {
    try {
        const reward = await Reward_js_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reward)
            return res.status(404).json({ message: 'Reward not found' });
        res.json(reward);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating reward' });
    }
};
exports.updateReward = updateReward;
const deleteReward = async (req, res) => {
    try {
        const reward = await Reward_js_1.default.findByIdAndDelete(req.params.id);
        if (!reward)
            return res.status(404).json({ message: 'Reward not found' });
        res.json({ message: 'Reward deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting reward' });
    }
};
exports.deleteReward = deleteReward;
const getAllRewards = async (req, res) => {
    try {
        const rewards = await Reward_js_1.default.find().sort({ createdAt: -1 });
        res.json(rewards);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching rewards' });
    }
};
exports.getAllRewards = getAllRewards;
const getRedemptions = async (req, res) => {
    try {
        const redemptions = await Redemption_js_1.default.find()
            .populate('userId', 'name email')
            .populate('rewardId', 'name imageUrl')
            .sort({ createdAt: -1 });
        res.json(redemptions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching redemptions' });
    }
};
exports.getRedemptions = getRedemptions;
const fulfillRedemption = async (req, res) => {
    try {
        const redemption = await Redemption_js_1.default.findById(req.params.id);
        if (!redemption)
            return res.status(404).json({ message: 'Redemption not found' });
        if (redemption.status !== 'pending') {
            return res.status(400).json({ message: `Redemption is already ${redemption.status}` });
        }
        redemption.status = 'fulfilled';
        await redemption.save();
        res.json({ message: 'Redemption marked as fulfilled', redemption });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fulfilling redemption' });
    }
};
exports.fulfillRedemption = fulfillRedemption;
