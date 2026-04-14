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
        const signupRes = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        }).catch(err => {
            console.error("Fetch error during signup:", err);
            throw err;
        });

        const signupData = await signupRes.json();
        
        if (!signupRes.ok) {
            console.error("Signup failed:", signupData);
            return;
        }

        console.log("Signup successful!");

        console.log(`\n[1.5] Logging in...`);
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        }).catch(err => {
            console.error("Fetch error during login:", err);
            throw err;
        });
        const loginData = await loginRes.json();
        
        if (!loginRes.ok) {
            console.error("Login failed:", loginData);
            return;
        }

        token = loginData.token;
        console.log("Login successful!");

        // 2. Create Property
        console.log("\n[2] Creating property...");
        const propRes = await fetch(`${BASE_URL}/properties`, {
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
        
        const propData = await propRes.json();
        if (!propRes.ok) {
            console.error("Property creation failed:", propData);
            return;
        }

        const propertyId = propData._id;
        console.log(`Property created! ID: ${propertyId}`);

        // 3. Create Maintenance Record
        console.log("\n[3] Creating Maintenance Record...");
        const mainRes = await fetch(`${BASE_URL}/maintenance`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                propertyId: propertyId,
                type: "Plumbing",
                description: "Fixing a leaky pipe in the bathroom.",
                cost: 150,
                status: "Pending" 
            })
        });
        
        const mainData = await mainRes.json();
        console.log("Status Code:", mainRes.status);
        console.log("Response Body:", mainData);
        
        if (mainRes.status === 201) {
            console.log("\n✅ SUCCESS: Maintenance record created properly!");
        } else {
            console.log("\n❌ FAILED: Received non-201 status code.");
            if (mainData.errors) {
                console.log("Validation Errors:", mainData.errors);
            }
        }

    } catch (e) {
        console.error("Error during test execution:", e);
    }
}

runTest();
