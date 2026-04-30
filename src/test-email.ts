import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from './utils/notifications.js';

async function runTest() {
    console.log("Testing Resend email delivery...");

    if (!process.env.RESEND_API_KEY) {
        console.error("❌ RESEND_API_KEY is missing in your .env file!");
        process.exit(1);
    }

    // You can change this to your actual email to test delivery
    const testRecipient = process.env.TEST_EMAIL || "nationx22@gmail.com";

    console.log(`Sending test email to: ${testRecipient}`);

    try {
        const { data, error } = await sendEmail({
            to: testRecipient,
            subject: "Resend Configuration Test",
            html: `<h1>Hello!</h1><p>If you are reading this, Resend is working correctly.</p>`
        });

        if (error) {
            console.error("\n❌ Resend API returned an error:");
            console.error(JSON.stringify(error, null, 2));
        } else {
            console.log("\n✅ Email sent successfully!");
            console.log("Response from Resend:", data);
        }
    } catch (err: any) {
        console.error("\n❌ Unexpected error during email sending:");
        console.error(err.message || err);
    }
}

runTest().catch(console.error);
