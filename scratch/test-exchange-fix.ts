// We'll just write a vanilla node script and run it with tsx
// We'll just write a vanilla node script and run it with tsx

async function testExchangeRateAPI() {
    console.log("Testing GET /api/v1/exchange-rates...");
    try {
        const response = await fetch("http://localhost:5000/api/v1/exchange-rates");
        console.log(`Status: ${response.status}`);
        
        const data = await response.json();
        console.log("Response JSON:");
        console.log(JSON.stringify(data, null, 2));
        
        if (response.ok) {
            console.log("✅ Test Passed: Endpoint returned 200 OK");
        } else {
            console.log("❌ Test Failed: Endpoint returned error status");
        }
    } catch (error) {
        console.error("❌ Test Failed with Exception:", error);
    }
}

testExchangeRateAPI();
