import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import { signupSchema, loginSchema } from '../utils/validations.js';
import { sendEmail } from '../utils/notifications.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
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
        const normalizedEmail = email.toLowerCase();

        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            // Create new user if not exists
            user = new User({
                name,
                email: normalizedEmail,
                password: await bcrypt.hash(Math.random().toString(36).slice(-8), 12), // Random password
                googleId,
                isVerified: true, // Google emails are verified
                role: 'LANDLORD', // Default for Google login
            });
            await user.save();
        }

        const jwtToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, currency: user.currency } });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Google login failed' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const validatedData = signupSchema.parse(req.body);
        const { name, password, phone, role, referralCode: usedReferralCode } = validatedData;
        const email = validatedData.email.toLowerCase();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate a unique referral code for the new user
        const newReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. A3F2C1B9

        // Normalize role
        const userRole = (role && typeof role === 'string') 
            ? role.toUpperCase() as any 
            : 'LANDLORD';

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            referralCode: newReferralCode,
            role: userRole,
            adminPrivilege: userRole === 'ADMIN',
        });

        // If a referral code was provided, credit the referrer
        if (usedReferralCode) {
            const referrer = await User.findOne({ referralCode: usedReferralCode });
            if (referrer) {
                user.referredBy = referrer._id as any;
                referrer.referralPoints = (referrer.referralPoints || 0) + 1;
                await referrer.save();
            }
        }

        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            referralCode: newReferralCode,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ 
                message: error.errors[0].message,
                details: error.errors 
            });
        }
        console.error('Registration error detail:', {
            error: error.message,
            stack: error.stack,
            body: { ...req.body, password: '[REDACTED]' }
        });
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { password } = validatedData;
        const email = validatedData.email.toLowerCase();

        const user = await User.findOne({ email });
        if (!user || !user.password) {
            console.log(`Login failed: User not found or no password for ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user._id, name: user.name, email: user.email, currency: user.currency } });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ message: "If the email exists, a reset link has been sent." });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hash;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.tobfolio.com'}/reset-password?token=${resetToken}`;

        try {
            const { data, error } = await sendEmail({
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

            if (error) {
                console.error("Resend API Email error:", error);
            } else {
                console.log("Password reset email sent successfully:", data);
            }
        } catch (emailError) {
            console.error("Unexpected Email error:", emailError);
        }

        res.json({ message: "Thanks! An email was sent that will ask you to click on a link to verify that you own this account." });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        const hash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password successfully reset!" });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const acceptInvite = async (req: Request, res: Response) => {
    try {
        const { token, name, password } = req.body;
        
        const invitation = await Invitation.findOne({ token, status: 'PENDING' });
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found or already accepted' });
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = 'EXPIRED';
            await invitation.save();
            return res.status(400).json({ message: 'Invitation has expired' });
        }

        const existingUser = await User.findOne({ email: invitation.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        const newUser = new User({
            name,
            email: invitation.email,
            password: hashedPassword,
            role: invitation.role,
            landlordId: invitation.landlordId,
            adminPrivilege: invitation.adminPrivilege,
            isVerified: true,
        });

        await newUser.save();

        invitation.status = 'ACCEPTED';
        await invitation.save();

        const jwtToken = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'Account created successfully',
            token: jwtToken,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                currency: newUser.currency,
            }
        });
    } catch (error) {
        console.error('Accept invite error:', error);
        res.status(500).json({ message: 'Error accepting invitation' });
    }
};
