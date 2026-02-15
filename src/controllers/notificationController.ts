import { Request, Response } from 'express';
import { sendEmail, sendSMS } from '../utils/notifications.js';

export const sendNotification = async (req: Request, res: Response) => {
    try {
        const { to, subject, html, body, type = "email" } = req.body;

        if (type === "email") {
            const { data, error } = await sendEmail({ to, subject, html });

            if (error) {
                return res.status(400).json({ error });
            }

            return res.status(200).json({ data });
        }

        if (type === "sms") {
            const message = await sendSMS({ to, body: body || html || "No message body provided" });
            return res.status(200).json({ sid: message.sid });
        }

        return res.status(400).json({ error: "Invalid notification type" });
    } catch (error: any) {
        console.error("Notification error:", error);
        res.status(500).json({ message: "Error sending notification", error: error.message });
    }
};
