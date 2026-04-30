import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import Property from './models/Property.js';
import Tenant from './models/Tenant.js';
import { calculateDashboardMetrics } from './utils/dashboardUtils.js';

async function runTest() {
    console.log("Starting Occupancy Rate test...\n");

    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI is missing in .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);

    // 1. Setup a dummy landlord
    const testEmail = `landlord_${Date.now()}@example.com`;
    const landlord = new User({
        name: "Test Landlord",
        email: testEmail,
        role: "LANDLORD",
    });
    await landlord.save();
    console.log(`✅ Created test landlord ID: ${landlord._id}`);

    // 2. Setup 1 Property (with only 1 unit)
    const property = new Property({
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
    for(let i = 0; i < 5; i++) {
        tenantPromises.push(new Tenant({
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
    const metrics = await calculateDashboardMetrics(landlord._id.toString());
    
    console.log("Returned Metrics:");
    console.log(`Total Units: ${metrics.totalUnits}`);
    console.log(`Occupied Units (Active Tenants): ${metrics.occupiedUnits}`);
    console.log(`Raw Occupancy Rate would be: (5 / 1) * 100 = 500%`);
    console.log(`Capped Occupancy Rate: ${metrics.occupancyRate}%`);

    if (metrics.occupancyRate === 100) {
        console.log("\n✅ SUCCESS: The occupancy rate was correctly capped at 100%!");
    } else {
        console.log(`\n❌ FAILURE: The occupancy rate was ${metrics.occupancyRate} instead of 100%.`);
    }

    // 5. Cleanup
    console.log("\nCleaning up test data...");
    await Tenant.deleteMany({ landlordId: landlord._id });
    await Property.deleteMany({ landlordId: landlord._id });
    await User.deleteOne({ _id: landlord._id });
    await mongoose.disconnect();
    
    console.log("Done.");
}

runTest().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
