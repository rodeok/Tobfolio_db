"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRentals = void 0;
const Tenant_js_1 = __importDefault(require("../models/Tenant.js"));
const notifications_js_1 = require("../utils/notifications.js");
const checkRentals = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const fourteenDaysFromNow = new Date(today);
        fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const getDayRange = (date) => {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            return { $gte: start, $lte: end };
        };
        const tenants = await Tenant_js_1.default.find({
            $or: [
                { rentEnd: getDayRange(thirtyDaysFromNow) },
                { rentEnd: getDayRange(fourteenDaysFromNow) },
                { rentEnd: getDayRange(sevenDaysFromNow) },
                { rentEnd: getDayRange(sevenDaysAgo) }
            ],
            isActive: true,
        }).populate('landlordId');
        let notificationsSent = 0;
        for (const tenant of tenants) {
            const landlord = tenant.landlordId;
            if (!landlord) {
                console.warn(`Tenant ${tenant._id} has no landlord linked.`);
                continue;
            }
            const timeDiff = new Date(tenant.rentEnd).getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            let sentAny = false;
            // Notify Landlord (30 days and 7 days before)
            if (daysDiff === 30 || daysDiff === 7) {
                const messageSubject = `Lease Expiring Soon: ${tenant.name}`;
                const messageBody = `Reminder: The lease for tenant ${tenant.name} at Unit ${tenant.unitNumber} expires in ${daysDiff} days (on ${new Date(tenant.rentEnd).toLocaleDateString()}). Please check your Tobfolio dashboard.`;
                const htmlBody = `
                    <h1>Lease Expiration Reminder</h1>
                    <p>Hello ${landlord.name || 'Landlord'},</p>
                    <p>This is an automatic reminder that the lease for <strong>${tenant.name}</strong> (Unit: ${tenant.unitNumber}) is set to expire in <strong>${daysDiff} days</strong>.</p>
                    <p><strong>Expiration Date:</strong> ${new Date(tenant.rentEnd).toLocaleDateString()}</p>
                    <p>Please log in to your dashboard to manage this lease.</p>
                `;
                if (landlord.email) {
                    await (0, notifications_js_1.sendEmail)({ to: landlord.email, subject: messageSubject, html: htmlBody });
                    sentAny = true;
                }
                if (landlord.phone) {
                    await (0, notifications_js_1.sendSMS)({ to: landlord.phone, body: messageBody });
                    sentAny = true;
                }
            }
            // Notify Tenant 14 days before rent expires
            if (daysDiff === 14) {
                const tenantSubject = `Rent Due Reminder - Unit ${tenant.unitNumber}`;
                const tenantBody = `Hello ${tenant.name}, \n\nThis is a reminder that your rent for Unit ${tenant.unitNumber} is due in 14 days on ${new Date(tenant.rentEnd).toLocaleDateString()}.`;
                const tenantHtml = `
                    <h2>Rent Due Reminder</h2>
                    <p>Hello ${tenant.name},</p>
                    <p>This is an automated reminder that your rent for <strong>Unit ${tenant.unitNumber}</strong> is due in <strong>14 days</strong>.</p>
                    <p><strong>Due Date:</strong> ${new Date(tenant.rentEnd).toLocaleDateString()}</p>
                    <p>Thank you!</p>
                `;
                if (tenant.email) {
                    await (0, notifications_js_1.sendEmail)({ to: tenant.email, subject: tenantSubject, html: tenantHtml });
                    sentAny = true;
                }
                if (tenant.phone) {
                    await (0, notifications_js_1.sendSMS)({ to: tenant.phone, body: tenantBody });
                    sentAny = true;
                }
            }
            // Notify Tenant 7 days AFTER rent expires (daysDiff would be -7)
            if (daysDiff === -7) {
                const tenantSubject = `Rent Overdue Notice - Unit ${tenant.unitNumber}`;
                const tenantBody = `Hello ${tenant.name}, \n\nYour rent for Unit ${tenant.unitNumber} was due 7 days ago on ${new Date(tenant.rentEnd).toLocaleDateString()}. Please contact your landlord to renew. Landlord Email: ${landlord.email}, Phone: ${landlord.phone}.`;
                const tenantHtml = `
                    <h2>Rent Overdue Notice</h2>
                    <p>Hello ${tenant.name},</p>
                    <p>Your rent for <strong>Unit ${tenant.unitNumber}</strong> was due 7 days ago on <strong>${new Date(tenant.rentEnd).toLocaleDateString()}</strong>.</p>
                    <p>Please contact your landlord immediately to discuss renewal or payment:</p>
                    <ul>
                        <li><strong>Email:</strong> ${landlord.email || 'N/A'}</li>
                        <li><strong>Phone:</strong> ${landlord.phone || 'N/A'}</li>
                    </ul>
                    <p>Thank you!</p>
                `;
                if (tenant.email) {
                    await (0, notifications_js_1.sendEmail)({ to: tenant.email, subject: tenantSubject, html: tenantHtml });
                    sentAny = true;
                }
                if (tenant.phone) {
                    await (0, notifications_js_1.sendSMS)({ to: tenant.phone, body: tenantBody });
                    sentAny = true;
                }
            }
            if (sentAny) {
                notificationsSent++;
            }
        }
        res.json({
            success: true,
            message: `Checked rentals. Found ${tenants.length} expiring soon.`,
            notificationsSent,
        });
    }
    catch (error) {
        console.error('Error in cron job:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
exports.checkRentals = checkRentals;
