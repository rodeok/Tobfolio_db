const BASE_URL = 'http://localhost:5000/api/v1';

async function runTest() {
    console.log("=== Tobfolio Maintenance Route Test ===");

    const randomStr = Math.random().toString(36).substring(7);
    const email = `testuser_${randomStr}@example.com`;
    const password = "password123";
    const name = "Test User";

    let token = "";

    try {
        // 1. Signup
        console.log(`\n[1] Signing up user: ${email}...`);
        let res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        let data = await res.json();
        
        if (!res.ok) {
            console.error("Signup failed:", data);
            return;
        }

        console.log("Signup successful!");

        console.log(`\n[1.5] Logging in...`);
        let loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        let loginData = await loginRes.json();
        
        if (!loginRes.ok) {
            console.error("Login failed:", loginData);
            return;
        }

        token = loginData.token;
        console.log("Login successful!");

        // 2. Create Property
        console.log("\n[2] Creating property...");
        res = await fetch(`${BASE_URL}/properties`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Test Maintenance Property",
                address: "123 Random Test Blvd",
                type: "Apartment"
            })
        });
        
        data = await res.json();
        if (!res.ok) {
            console.error("Property creation failed:", data);
            return;
        }

        const propertyId = data._id;
        console.log(`Property created! ID: ${propertyId}`);

        // 3. Create Maintenance Record WITH `type`
        console.log("\n[3] Creating Maintenance Record...");
        res = await fetch(`${BASE_URL}/maintenance`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                propertyId: propertyId,
                type: "Plumbing",
                // Zod requires 'type', rather than 'title'.
                description: "Fixing a leaky pipe in the bathroom.",
                cost: 150,
                // Match backend enum: 'Pending', 'In Progress', 'Completed', 'Cancelled'
                status: "Pending" 
            })
        });
        
        data = await res.json();
        console.log("Status Code:", res.status);
        console.log("Response Body:", data);
        
        if (res.status === 201) {
            console.log("\n✅ SUCCESS: Maintenance record created properly!");
        } else {
            console.log("\n❌ FAILED: Received non-201 status code.");
        }

    } catch (e) {
        console.error("Error during test:", e);
    }
}

runTest();
