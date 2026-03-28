import { Resend } from 'resend';
import twilio from 'twilio';

let resendInstance: Resend | null = null;
let twilioInstance: any = null;

const getResend = () => {
    if (!resendInstance) {
        resendInstance = new Resend(process.env.RESEND_API_KEY);
    }
    return resendInstance;
};

const getTwilio = () => {
    if (!twilioInstance) {
        twilioInstance = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    return twilioInstance;
};

export const sendEmail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
    const resend = getResend();
    return await resend.emails.send({
        from: "Tobfolio <noreply@tobfolio.com>",
        to: [to],
        subject,
        html,
    });
};

export const sendSMS = async ({ to, body }: { to: string, body: string }) => {
    const twilioClient = getTwilio();
    return await twilioClient.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
    });
};
