import { Response } from 'express';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import crypto from 'crypto';
import { Request } from 'express';
import { sendEmail } from '../utils/notifications.js';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
        landlordId?: string;
        adminPrivilege: boolean;
        name?: string;
    };
}

export const inviteMember = async (req: AuthRequest, res: Response) => {
    try {
        const { email, role, adminPrivilege } = req.body;

        if (req.user?.role !== 'LANDLORD') {
            return res.status(403).json({ message: 'Only landlords can invite team members' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check if there's already a pending invitation
        const existingInvite = await Invitation.findOne({ email, status: 'PENDING' });
        if (existingInvite) {
            return res.status(400).json({ message: 'A pending invitation already exists for this email' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours expiry

        const invitation = await Invitation.create({
            email,
            role,
            adminPrivilege,
            landlordId: req.user.userId,
            token,
            expiresAt,
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.tobfolio.com';
        const inviteLink = `${appUrl}/invite/${token}`;

        const { data, error: emailError } = await sendEmail({
            to: email,
            subject: `Invitation to join Tobfolio`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; padding: 20px; background: #f9fafb;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <h2 style="color: #0047FF; margin-top: 0;">Welcome to Tobfolio Team</h2>
                        <p>Hi there,</p>
                        <p><strong>${req.user.name || 'A landlord'}</strong> has invited you to join their team as a <strong>${role.toLowerCase()}</strong> on Tobfolio.</p>
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${inviteLink}" style="display: inline-block; background-color: #0047FF; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">Accept Invitation</a>
                        </div>
                        <p style="font-size: 14px; color: #6b7280;">This invitation will expire in 48 hours.</p>
                        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 30px 0;">
                        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} Tobfolio. All rights reserved.</p>
                    </div>
                </div>
            `
        });

        if (emailError) {
            console.error('Resend Email Error:', emailError);
            // We still created the invitation in DB, but flagged that email failed
        } else {
            console.log('Invitation email sent successfully:', data);
        }

        res.status(201).json({
            message: 'Invitation sent successfully',
            invitation: {
                email: invitation.email,
                role: invitation.role,
                status: invitation.status,
                expiresAt: invitation.expiresAt,
            }
        });
    } catch (error) {
        console.error('Invite error:', error);
        res.status(500).json({ message: 'Error sending invitation' });
    }
};

export const getInviteDetails = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const invitation = await Invitation.findOne({ token, status: 'PENDING' })
            .populate('landlordId', 'name email');

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found or has expired' });
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = 'EXPIRED';
            await invitation.save();
            return res.status(400).json({ message: 'Invitation has expired' });
        }

        res.json({
            email: invitation.email,
            role: invitation.role,
            adminPrivilege: invitation.adminPrivilege,
            landlord: invitation.landlordId,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invitation details' });
    }
};

export const getTeam = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'LANDLORD') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const members = await User.find({ landlordId: req.user.userId }).select('-password');
        const pendingInvites = await Invitation.find({ landlordId: req.user.userId, status: 'PENDING' });

        res.json({
            members,
            pendingInvites,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team' });
    }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'LANDLORD') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { id } = req.params;
        const member = await User.findOneAndDelete({ _id: id, landlordId: req.user.userId });
        
        if (!member) {
            // Check if it's a pending invitation
            const invite = await Invitation.findOneAndDelete({ _id: id, landlordId: req.user.userId });
            if (!invite) {
                return res.status(404).json({ message: 'Member or invitation not found' });
            }
        }

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing member' });
    }
};

export const updateMemberPrivileges = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'LANDLORD') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { id } = req.params;
        const { adminPrivilege } = req.body;

        const member = await User.findOneAndUpdate(
            { _id: id, landlordId: req.user.userId },
            { adminPrivilege },
            { new: true }
        ).select('-password');

        if (!member) {
            // Check if it's a pending invitation
            const invite = await Invitation.findOneAndUpdate(
                { _id: id, landlordId: req.user.userId },
                { adminPrivilege },
                { new: true }
            );
            if (!invite) {
                return res.status(404).json({ message: 'Member or invitation not found' });
            }
            return res.json(invite);
        }

        res.json(member);
    } catch (error) {
        res.status(500).json({ message: 'Error updating member privileges' });
    }
};
