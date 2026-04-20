"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCurrency = exports.deleteAccount = exports.updatePassword = exports.updateProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_js_1 = __importDefault(require("../models/User.js"));
const updateProfile = async (req, res) => {
    try {
        const { name, phone, about, email } = req.body;
        const user = await User_js_1.default.findById(req.user?.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.about = about || user.about;
        if (email && email !== user.email) {
            const emailExists = await User_js_1.default.findOne({ email });
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
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateProfile = updateProfile;
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Missing fields' });
        }
        const user = await User_js_1.default.findById(req.user?.userId);
        if (!user || !user.password) {
            return res.status(404).json({ message: 'User not found or invalid password state' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid current password' });
        }
        user.password = await bcryptjs_1.default.hash(newPassword, 12);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updatePassword = updatePassword;
const deleteAccount = async (req, res) => {
    try {
        const user = await User_js_1.default.findByIdAndDelete(req.user?.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteAccount = deleteAccount;
const updateCurrency = async (req, res) => {
    try {
        const { currency } = req.body;
        const supportedCurrencies = ['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'GHS', 'RWF'];
        if (!currency || !supportedCurrencies.includes(currency)) {
            return res.status(400).json({ message: 'Invalid or missing currency' });
        }
        const user = await User_js_1.default.findById(req.user?.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.currency = currency;
        await user.save();
        res.json({
            message: 'Currency updated successfully',
            currency: user.currency
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateCurrency = updateCurrency;
