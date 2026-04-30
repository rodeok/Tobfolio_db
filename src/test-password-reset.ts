import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import crypto from 'crypto';
import User from './models/User.js';

async function runTest() {
    console.log("Starting password reset database verification test...");
    
    // Connect to database
    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI is not set in .env");
        process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Create a dummy user
    const testEmail = `test_${Date.now()}@example.com`;
    const user = new User({
        name: "Password Reset Test User",
        email: testEmail,
        password: "oldpassword123",
        role: "LANDLORD",
        isVerified: true
    });
    await user.save();
    console.log(`✅ Created test user: ${testEmail}`);

    // --- 1. Simulate Forgot Password ---
    console.log("\n--- Simulating Forgot Password ---");
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hash;
    // Set expiration to 1 hour from now
    user.resetPasswordExpires = new Date(Date.now() + 3600000); 
    await user.save();
    
    console.log(`✅ Generated reset token: ${resetToken}`);
    console.log(`✅ Token hash saved to DB: ${hash}`);
    console.log(`✅ Expiration saved: ${user.resetPasswordExpires}`);

    // --- 2. Simulate Reset Password Check ---
    console.log("\n--- Simulating Reset Password Token Validation ---");
    
    const searchHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Test 1: The NEW method (using new Date())
    const foundUserNewMethod = await User.findOne({
        resetPasswordToken: searchHash,
        resetPasswordExpires: { $gt: new Date() }
    });

    if (foundUserNewMethod) {
        console.log("✅ SUCCESS: User found using the fixed `new Date()` comparison!");
    } else {
        console.log("❌ FAILURE: User not found using the fixed `new Date()` comparison.");
    }

    // Test 2: The OLD method (using Date.now()) to demonstrate the bug
    try {
        const foundUserOldMethod = await User.findOne({
            resetPasswordToken: searchHash,
            resetPasswordExpires: { $gt: Date.now() as any }
        });
        
        if (foundUserOldMethod) {
            console.log("⚠️ Old method (Date.now()) also found it. (Mongoose behavior might vary based on schema strictness/version)");
        } else {
            console.log("❌ EXPECTED FAILURE: Old method (Date.now()) failed to find the user. This proves the bug existed!");
        }
    } catch (e: any) {
        console.log(`❌ EXPECTED FAILURE: Old method (Date.now()) threw an error: ${e.message}`);
    }

    // Cleanup
    console.log("\n--- Cleaning up ---");
    await User.deleteOne({ email: testEmail });
    console.log("✅ Cleaned up test user.");
    
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
}

runTest().catch(err => {
    console.error("Test script failed:", err);
    process.exit(1);
});
