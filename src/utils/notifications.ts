import { Resend } from 'resend';
import twilio from 'twilio';

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendEmail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
    return await resend.emails.send({
        from: "Landlord Management <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
    });
};

export const sendSMS = async ({ to, body }: { to: string, body: string }) => {
    return await twilioClient.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
    });
};
