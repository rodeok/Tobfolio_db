import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User.js';
import { signupSchema, loginSchema } from '@/utils/validations.js';
import { sendEmail } from '@/utils/notifications.js';

export const register = async (req: Request, res: Response) => {
    try {
        const validatedData = signupSchema.parse(req.body);
        const { name, email, password, phone } = validatedData;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
        });

        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        const user = await User.findOne({ email });
        if (!user || !user.password) {
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

        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
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

        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: "80m" });
        const resetLink = `https://www.tobfolio.com/reset-password?token=${token}`;

        try {
            await sendEmail({
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
                            <p>This link will expire in <strong>80 minutes</strong>.</p>
                            <p>If you didn’t request a password reset, you can safely ignore this email.</p>
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
                            <p style="font-size: 13px; color: #6b7280;">– The Tobfolio Team</p>
                            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 10px;">&copy; ${new Date().getFullYear()} Tobfolio. All rights reserved.</p>
                        </div>
                    </div>
                `,
            });
        } catch (emailError) {
            console.error("Email error:", emailError);
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { email: string };
        const hashed = await bcrypt.hash(password, 10);

        const user = await User.findOneAndUpdate({ email: decoded.email }, { password: hashed });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: "Password successfully reset!" });
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired link." });
    }
};
