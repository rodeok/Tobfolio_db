const BASE_URL = 'http://localhost:5000/api/v1';

async function runTest() {
    console.log("=== Testing Property Unit Management Error Scenarios ===");

    // Use existing test user credentials
    const email = "test@example.com";
    const password = "password123";
    const name = "Test User";

    let token = "";

    try {
        // 1. Try to login with existing user, or signup if needed
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
        } else {
            console.log("Login failed, attempting signup...");
            const signupRes = await fetch(`${BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            const signupData = await signupRes.json();
            
            if (!signupRes.ok) {
                console.error("Signup failed:", signupData);
                console.log("⚠️ Skipping tests due to auth rate limiting");
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
        // Test 1: Invalid managementType
        console.log("\n[1] Test POST /api/v1/properties with invalid managementType...");
        const invalidManagementTypeRes = await fetch(`${BASE_URL}/properties`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Test Property",
                address: "123 Test St",
                type: "Apartment",
                managementType: "invalid_type",
                unitType: "flat"
            })
        });
        console.log("Status Code:", invalidManagementTypeRes.status);
        const invalidManagementTypeData = await invalidManagementTypeRes.json();
        console.log("Response:", invalidManagementTypeData);
        if (invalidManagementTypeRes.status === 400) {
            console.log("✅ Correctly returns 400 Bad Request");
        } else {
            console.log("❌ Should return 400");
        }

        // Test 2: Invalid unitType
        console.log("\n[2] Test POST /api/v1/properties with invalid unitType...");
        const invalidUnitTypeRes = await fetch(`${BASE_URL}/properties`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Test Property",
                address: "123 Test St",
                type: "Apartment",
                managementType: "single_unit",
                unitType: "invalid_unit"
            })
        });
        console.log("Status Code:", invalidUnitTypeRes.status);
        const invalidUnitTypeData = await invalidUnitTypeRes.json();
        console.log("Response:", invalidUnitTypeData);
        if (invalidUnitTypeRes.status === 400) {
            console.log("✅ Correctly returns 400 Bad Request");
        } else {
            console.log("❌ Should return 400");
        }

        // Test 3: Single unit without unitNumber
        console.log("\n[3] Test POST /api/v1/properties with single_unit but missing unitNumber...");
        const missingUnitNumberRes = await fetch(`${BASE_URL}/properties`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Test Property",
                address: "123 Test St",
                type: "Apartment",
                managementType: "single_unit",
                unitType: "flat"
                // Missing unitNumber
            })
        });
        console.log("Status Code:", missingUnitNumberRes.status);
        const missingUnitNumberData = await missingUnitNumberRes.json();
        console.log("Response:", missingUnitNumberData);
        if (missingUnitNumberRes.status === 400) {
            console.log("✅ Correctly returns 400 Bad Request");
        } else {
            console.log("❌ Should return 400");
        }

        // Test 4: Entire building without totalUnits
        console.log("\n[4] Test POST /api/v1/properties with entire_building but missing totalUnits...");
        const missingTotalUnitsRes = await fetch(`${BASE_URL}/properties`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Test Property",
                address: "123 Test St",
                type: "Apartment",
                managementType: "entire_building",
                unitType: "flat"
                // Missing totalUnits
            })
        });
        console.log("Status Code:", missingTotalUnitsRes.status);
        const missingTotalUnitsData = await missingTotalUnitsRes.json();
        console.log("Response:", missingTotalUnitsData);
        if (missingTotalUnitsRes.status === 400) {
            console.log("✅ Correctly returns 400 Bad Request");
        } else {
            console.log("❌ Should return 400");
        }

        // Test 5: Valid single unit property
        console.log("\n[5] Test POST /api/v1/properties with valid single_unit data...");
        const validSingleUnitRes = await fetch(`${BASE_URL}/properties`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Test Single Unit Property",
                address: "123 Test St",
                type: "Apartment",
                managementType: "single_unit",
                unitType: "flat",
                unitNumber: "A-101",
                unitDescription: "Corner unit with balcony"
            })
        });
        console.log("Status Code:", validSingleUnitRes.status);
        const validSingleUnitData = await validSingleUnitRes.json();
        console.log("Response:", JSON.stringify(validSingleUnitData, null, 2));
        if (validSingleUnitRes.status === 201) {
            console.log("✅ Single unit property created successfully");
        } else {
            console.log("❌ Should return 201");
        }

        // Test 6: Valid entire building property
        console.log("\n[6] Test POST /api/v1/properties with valid entire_building data...");
        const validBuildingRes = await fetch(`${BASE_URL}/properties`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Test Building Property",
                address: "456 Building Ave",
                type: "Apartment",
                managementType: "entire_building",
                unitType: "flat",
                totalUnits: 50,
                unitDescription: "Residential apartment complex"
            })
        });
        console.log("Status Code:", validBuildingRes.status);
        const validBuildingData = await validBuildingRes.json();
        console.log("Response:", JSON.stringify(validBuildingData, null, 2));
        if (validBuildingRes.status === 201) {
            console.log("✅ Entire building property created successfully");
        } else {
            console.log("❌ Should return 201");
        }

        // Test 7: Property without unit management fields (backward compatibility)
        console.log("\n[7] Test POST /api/v1/properties without unit management fields (backward compatibility)...");
        const noUnitFieldsRes = await fetch(`${BASE_URL}/properties`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Legacy Property",
                address: "789 Legacy Rd",
                type: "Apartment"
            })
        });
        console.log("Status Code:", noUnitFieldsRes.status);
        const noUnitFieldsData = await noUnitFieldsRes.json();
        console.log("Response:", noUnitFieldsData);
        if (noUnitFieldsRes.status === 201) {
            console.log("✅ Backward compatibility maintained - property created without unit fields");
        } else {
            console.log("⚠️ Backward compatibility may be broken");
        }

        // Test 8: Single unit with villa type
        console.log("\n[8] Test POST /api/v1/properties with single_unit villa type...");
        const villaRes = await fetch(`${BASE_URL}/properties`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Test Villa",
                address: "100 Villa Lane",
                type: "Villa",
                managementType: "single_unit",
                unitType: "villa",
                unitNumber: "V-1"
            })
        });
        console.log("Status Code:", villaRes.status);
        const villaData = await villaRes.json();
        console.log("Response:", villaData);
        if (villaRes.status === 201) {
            console.log("✅ Villa property created successfully");
        } else {
            console.log("❌ Should return 201");
        }

        // Test 9: Entire building with office type
        console.log("\n[9] Test POST /api/v1/properties with entire_building office type...");
        const officeRes = await fetch(`${BASE_URL}/properties`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name: "Test Office Building",
                address: "200 Business Park",
                type: "Office",
                managementType: "entire_building",
                unitType: "office",
                totalUnits: 100
            })
        });
        console.log("Status Code:", officeRes.status);
        const officeData = await officeRes.json();
        console.log("Response:", officeData);
        if (officeRes.status === 201) {
            console.log("✅ Office building created successfully");
        } else {
            console.log("❌ Should return 201");
        }

        console.log("\n=== Property Unit Management Error Testing Complete ===");

    } catch (e) {
        console.error("Error during test execution:", e);
    }
}

runTest();
