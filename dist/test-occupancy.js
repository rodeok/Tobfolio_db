"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const User_js_1 = __importDefault(require("./models/User.js"));
const Property_js_1 = __importDefault(require("./models/Property.js"));
const Tenant_js_1 = __importDefault(require("./models/Tenant.js"));
const dashboardUtils_js_1 = require("./utils/dashboardUtils.js");
async function runTest() {
    console.log("Starting Occupancy Rate test...\n");
    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI is missing in .env");
        process.exit(1);
    }
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    // 1. Setup a dummy landlord
    const testEmail = `landlord_${Date.now()}@example.com`;
    const landlord = new User_js_1.default({
        name: "Test Landlord",
        email: testEmail,
        role: "LANDLORD",
    });
    await landlord.save();
    console.log(`✅ Created test landlord ID: ${landlord._id}`);
    // 2. Setup 1 Property (with only 1 unit)
    const property = new Property_js_1.default({
        landlordId: landlord._id,
        name: "Test Villa",
        address: "123 Test St",
        units: 1, // Only 1 unit!
        rentAmount: 1000,
        type: "apartment"
    });
    await property.save();
    console.log(`✅ Created 1 property with 1 unit.`);
    // 3. Setup 5 active Tenants assigned to this landlord
    // This creates an scenario where occupied units > total units
    const tenantPromises = [];
    for (let i = 0; i < 5; i++) {
        tenantPromises.push(new Tenant_js_1.default({
            landlordId: landlord._id,
            propertyId: property._id,
            name: `Tenant ${i}`,
            email: `tenant${i}@example.com`,
            phone: `080000000${i}`,
            rentAmount: 1000,
            rentStart: new Date(),
            rentEnd: new Date(Date.now() + 31536000000), // + 1 year
            rentDuration: "12 months",
            paymentFrequency: "monthly",
            unitNumber: `Unit ${i}`,
            isActive: true,
        }).save());
    }
    await Promise.all(tenantPromises);
    console.log(`✅ Created 5 ACTIVE tenants! (Expected raw occupancy: 500%)`);
    // 4. Test the metrics calculation
    console.log("\n--- Testing dashboardUtils.ts ---");
    const metrics = await (0, dashboardUtils_js_1.calculateDashboardMetrics)(landlord._id.toString());
    console.log("Returned Metrics:");
    console.log(`Total Units: ${metrics.totalUnits}`);
    console.log(`Occupied Units (Active Tenants): ${metrics.occupiedUnits}`);
    console.log(`Raw Occupancy Rate would be: (5 / 1) * 100 = 500%`);
    console.log(`Capped Occupancy Rate: ${metrics.occupancyRate}%`);
    if (metrics.occupancyRate === 100) {
        console.log("\n✅ SUCCESS: The occupancy rate was correctly capped at 100%!");
    }
    else {
        console.log(`\n❌ FAILURE: The occupancy rate was ${metrics.occupancyRate} instead of 100%.`);
    }
    // 5. Cleanup
    console.log("\nCleaning up test data...");
    await Tenant_js_1.default.deleteMany({ landlordId: landlord._id });
    await Property_js_1.default.deleteMany({ landlordId: landlord._id });
    await User_js_1.default.deleteOne({ _id: landlord._id });
    await mongoose_1.default.disconnect();
    console.log("Done.");
}
runTest().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
