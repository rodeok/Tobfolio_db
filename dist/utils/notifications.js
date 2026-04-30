"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = exports.sendEmail = void 0;
const resend_1 = require("resend");
const twilio_1 = __importDefault(require("twilio"));
let resendInstance = null;
let twilioInstance = null;
const getResend = () => {
    if (!resendInstance) {
        resendInstance = new resend_1.Resend(process.env.RESEND_API_KEY);
    }
    return resendInstance;
};
const getTwilio = () => {
    if (!twilioInstance) {
        twilioInstance = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    return twilioInstance;
};
const sendEmail = async ({ to, subject, html }) => {
    const resend = getResend();
    return await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Tobfolio <noreply@tobfolio.com>",
        to: [to],
        subject,
        html,
    });
};
exports.sendEmail = sendEmail;
const sendSMS = async ({ to, body }) => {
    const twilioClient = getTwilio();
    return await twilioClient.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
    });
};
exports.sendSMS = sendSMS;
