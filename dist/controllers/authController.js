"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.register = exports.googleLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
const google_auth_library_1 = require("google-auth-library");
const User_js_1 = __importDefault(require("../models/User.js"));
const validations_js_1 = require("../utils/validations.js");
const notifications_js_1 = require("../utils/notifications.js");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        // Fetch user info using access token
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            return res.status(400).json({ message: 'Invalid Google token' });
        }
        const payload = await response.json();
        const { email, name, sub: googleId } = payload;
        let user = await User_js_1.default.findOne({ email });
        if (!user) {
            // Create new user if not exists
            user = new User_js_1.default({
                name,
                email,
                password: await bcryptjs_1.default.hash(Math.random().toString(36).slice(-8), 12), // Random password
                googleId,
                isVerified: true, // Google emails are verified
            });
            await user.save();
        }
        const jwtToken = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Google login failed' });
    }
};
exports.googleLogin = googleLogin;
const register = async (req, res) => {
    try {
        const validatedData = validations_js_1.signupSchema.parse(req.body);
        const { name, email, password, phone } = validatedData;
        const { referralCode: usedReferralCode } = req.body;
        const existingUser = await User_js_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Generate a unique referral code for the new user
        const newReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. A3F2C1B9
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = new User_js_1.default({
            name,
            email,
            password: hashedPassword,
            phone,
            referralCode: newReferralCode,
        });
        // If a referral code was provided, credit the referrer
        if (usedReferralCode) {
            const referrer = await User_js_1.default.findOne({ referralCode: usedReferralCode });
            if (referrer) {
                user.referredBy = referrer._id;
                referrer.referralPoints = (referrer.referralPoints || 0) + 1;
                await referrer.save();
            }
        }
        await user.save();
        res.status(201).json({
            message: 'User created successfully',
            referralCode: newReferralCode,
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const validatedData = validations_js_1.loginSchema.parse(req.body);
        const { email, password } = validatedData;
        const user = await User_js_1.default.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_js_1.default.findOne({ email });
        if (!user) {
            return res.json({ message: "If the email exists, a reset link has been sent." });
        }
        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = hash;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();
        const resetLink = `https://www.tobfolio.com/reset-password?token=${resetToken}`;
        try {
            await (0, notifications_js_1.sendEmail)({
                to: email,
                subject: "Reset your password",
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; padding: 20px; background: #f9fafb;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <h2 style="color: #2D7AFF; text-align: center;">Reset Your Password</h2>
                            <p>Hi there,</p>
                            <p>We received a request to reset your password. Click the button below to set a new one:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetLink}" style="display: inline-block; background-color: #2D7AFF; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 500;">Reset Password</a>
                            </div>
                            <p>This link will expire in <strong>1 hour</strong>.</p>
                            <p>If you didn’t request a password reset, you can safely ignore this email.</p>
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
                            <p style="font-size: 13px; color: #6b7280;">– The Tobfolio Team</p>
                            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 10px;">&copy; ${new Date().getFullYear()} Tobfolio. All rights reserved.</p>
                        </div>
                    </div>
                `,
            });
        }
        catch (emailError) {
            console.error("Email error:", emailError);
        }
        res.json({ message: "Thanks! An email was sent that will ask you to click on a link to verify that you own this account." });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User_js_1.default.findOne({
            resetPasswordToken: hash,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token." });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: "Password successfully reset!" });
    }
    catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.resetPassword = resetPassword;
