"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BASE_URL = 'http://localhost:5000/api/v1';
async function runTest() {
    console.log("=== Testing Property Update Functionality ===");
    // Use existing test user credentials
    const email = "test@example.com";
    const password = "password123";
    const name = "Test User";
    let token = "";
    try {
        // 1. Auth
        console.log(`\n[1] Attempting login...`);
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
            token = loginData.token;
            console.log("✅ Login successful");
        }
        else {
            console.log("Login failed, attempting signup...");
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
            const retryLoginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const retryLoginData = await retryLoginRes.json();
            if (!retryLoginRes.ok) {
                console.error("Retry login failed:", retryLoginData);
                return;
            }
            token = retryLoginData.token;
            console.log("✅ Auth successful");
        }
        // 2. Create a property to update
        console.log("\n[2] Creating property for update test...");
        const createRes = await fetch(`${BASE_URL}/properties`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Update Test Property",
                address: "123 Update St",
                type: "Apartment",
                managementType: "single_unit",
                unitType: "flat",
                unitNumber: "U-101"
            })
        });
        const propertyData = await createRes.json();
        const propertyId = propertyData._id;
        console.log("Created Property ID:", propertyId);
        // 3. Update the property
        console.log("\n[3] Testing PUT /api/v1/properties/:id...");
        const updateRes = await fetch(`${BASE_URL}/properties/${propertyId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Updated Property Name",
                address: "456 Updated Ave",
                type: "Villa",
                managementType: "single_unit",
                unitType: "villa",
                unitNumber: "V-202",
                description: "This is an updated description"
            })
        });
        console.log("Status Code:", updateRes.status);
        const updatedData = await updateRes.json();
        console.log("Response:", JSON.stringify(updatedData, null, 2));
        if (updateRes.status === 200 && updatedData.name === "Updated Property Name") {
            console.log("✅ Property updated successfully");
        }
        else {
            console.log("❌ Property update failed");
        }
        // 4. Update with invalid data
        console.log("\n[4] Testing PUT /api/v1/properties/:id with invalid data (missing name)...");
        const invalidUpdateRes = await fetch(`${BASE_URL}/properties/${propertyId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                // name: "Updated Property Name", // missing
                address: "456 Updated Ave",
                type: "Villa"
            })
        });
        console.log("Status Code:", invalidUpdateRes.status);
        const invalidData = await invalidUpdateRes.json();
        console.log("Response:", JSON.stringify(invalidData, null, 2));
        if (invalidUpdateRes.status === 400) {
            console.log("✅ Correctly returned 400 for invalid data");
        }
        else {
            console.log("❌ Should have returned 400 for invalid data");
        }
        // 5. Cleanup
        console.log("\n[5] Cleaning up - deleting test property...");
        const deleteRes = await fetch(`${BASE_URL}/properties/${propertyId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (deleteRes.ok) {
            console.log("✅ Test property deleted");
        }
        else {
            console.log("❌ Failed to delete test property");
        }
        console.log("\n=== Property Update Functionality Testing Complete ===");
    }
    catch (e) {
        console.error("Error during test execution:", e);
    }
}
runTest();
