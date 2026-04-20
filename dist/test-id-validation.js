"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BASE_URL = 'http://localhost:5000/api/v1';
async function runTest() {
    console.log("=== Tobfolio ID Validation Test ===");
    const randomStr = Math.random().toString(36).substring(7);
    const email = `testuser_${randomStr}@example.com`;
    const password = "password123";
    const name = "Test User";
    let token = "";
    try {
        // 1. Signup & Login to get token
        console.log(`\n[1] Signing up user: ${email}...`);
        const signupRes = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const signupData = await signupRes.json();
        if (!signupRes.ok) {
            console.error("Signup failed:", signupData);
            return;
        }
        console.log(`\n[1.5] Logging in...`);
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        token = loginData.token;
        // 2. Test Invalid ID
        console.log("\n[2] Testing Maintenance Record with INVALID propertyId ('string')...");
        const mainRes = await fetch(`${BASE_URL}/maintenance`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                propertyId: "string", // This is the value that caused the error
                type: "Plumbing",
                description: "This should fail validation, not throw a CastError.",
                cost: 150
            })
        });
        const mainData = await mainRes.json();
        console.log("Status Code:", mainRes.status);
        console.log("Response Body:", JSON.stringify(mainData, null, 2));
        if (mainRes.status === 400 && mainData.message === "Validation failed") {
            console.log("\n✅ SUCCESS: Validation correctly caught the invalid ID!");
        }
        else {
            console.log("\n❌ FAILED: Validation did not catch the invalid ID as expected.");
        }
    }
    catch (e) {
        console.error("Error during test execution:", e);
    }
}
runTest();
