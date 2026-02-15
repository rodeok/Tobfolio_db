"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const notifications_js_1 = require("@/utils/notifications.js");
const sendNotification = async (req, res) => {
    try {
        const { to, subject, html, body, type = "email" } = req.body;
        if (type === "email") {
            const { data, error } = await (0, notifications_js_1.sendEmail)({ to, subject, html });
            if (error) {
                return res.status(400).json({ error });
            }
            return res.status(200).json({ data });
        }
        if (type === "sms") {
            const message = await (0, notifications_js_1.sendSMS)({ to, body: body || html || "No message body provided" });
            return res.status(200).json({ sid: message.sid });
        }
        return res.status(400).json({ error: "Invalid notification type" });
    }
    catch (error) {
        console.error("Notification error:", error);
        res.status(500).json({ message: "Error sending notification", error: error.message });
    }
};
exports.sendNotification = sendNotification;
