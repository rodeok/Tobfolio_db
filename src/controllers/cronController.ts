import { Request, Response } from 'express';
import Tenant from '../models/Tenant.js';
import { sendEmail, sendSMS } from '../utils/notifications.js';

export const checkRentals = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const getDayRange = (date: Date) => {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            return { $gte: start, $lte: end };
        };

        const tenants = await Tenant.find({
            $or: [
                { rentEnd: getDayRange(thirtyDaysFromNow) },
                { rentEnd: getDayRange(sevenDaysFromNow) }
            ],
            isActive: true,
        }).populate('landlordId');

        let notificationsSent = 0;

        for (const tenant of tenants) {
            const landlord = tenant.landlordId as any;

            if (!landlord) {
                console.warn(`Tenant ${tenant._id} has no landlord linked.`);
                continue;
            }

            const timeDiff = new Date(tenant.rentEnd).getTime() - today.getTime();
            const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

            const messageSubject = `Lease Expiring Soon: ${tenant.name}`;
            const messageBody = `Reminder: The lease for tenant ${tenant.name} at Unit ${tenant.unitNumber} expires in ${daysRemaining} days (on ${new Date(tenant.rentEnd).toLocaleDateString()}). Please check your Tobfolio dashboard.`;

            const htmlBody = `
                <h1>Lease Expiration Reminder</h1>
                <p>Hello ${landlord.name || 'Landlord'},</p>
                <p>This is an automatic reminder that the lease for <strong>${tenant.name}</strong> (Unit: ${tenant.unitNumber}) is set to expire in <strong>${daysRemaining} days</strong>.</p>
                <p><strong>Expiration Date:</strong> ${new Date(tenant.rentEnd).toLocaleDateString()}</p>
                <p>Please log in to your dashboard to manage this lease.</p>
            `;

            if (landlord.email) {
                await sendEmail({
                    to: landlord.email,
                    subject: messageSubject,
                    html: htmlBody,
                });
            }

            if (landlord.phone) {
                await sendSMS({
                    to: landlord.phone,
                    body: messageBody,
                });
            }

            notificationsSent++;
        }

        res.json({
            success: true,
            message: `Checked rentals. Found ${tenants.length} expiring soon.`,
            notificationsSent,
        });

    } catch (error) {
        console.error('Error in cron job:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
