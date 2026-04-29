"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const BASE_URL = 'http://localhost:5000/api/v1';
async function api(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token)
        headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    }
    catch {
        data = text;
    }
    if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}
async function testOccupancy() {
    console.log('\n🔵 ===== Occupancy Metrics Verification =====\n');
    // 1. Register landlord
    const landlord = {
        name: 'Stats Landlord',
        email: `stats${Date.now()}@test.com`,
        password: 'password123',
    };
    console.log('1️⃣  Registering landlord...');
    await api('POST', '/auth/register', landlord);
    const loginData = await api('POST', '/auth/login', {
        email: landlord.email,
        password: landlord.password,
    });
    const token = loginData.token;
    console.log('   ✅ Landlord registered & logged in.\n');
    // 2. Add a property with 10 units
    console.log('2️⃣  Creating property with 10 units...');
    const property = await api('POST', '/properties', {
        name: 'Ten Unit Plaza',
        address: '123 Stats St',
        type: 'Commercial',
        units: 10,
    }, token);
    const propertyId = property._id;
    console.log(`   ✅ Property created with ${property.units} units.\n`);
    // 3. Check initial stats
    console.log('3️⃣  Checking initial stats (should be 0 occupancy)...');
    const initialStats = await api('GET', '/properties/stats', undefined, token);
    console.log(`   Stats: ${JSON.stringify(initialStats)}`);
    if (initialStats.totalUnits === 10 && initialStats.occupiedUnits === 0 && initialStats.vacantUnits === 10) {
        console.log('   ✅ Initial stats correct.\n');
    }
    else {
        console.log('   ❌ Initial stats incorrect.\n');
    }
    // 4. Create 4 active tenants
    console.log('4️⃣  Creating 4 active tenants...');
    for (let i = 1; i <= 4; i++) {
        await api('POST', '/tenants', {
            propertyId,
            name: `Tenant ${i}`,
            email: `tenant${i}_${Date.now()}@test.com`,
            phone: `080${i}2345678`,
            rentAmount: 1000,
            rentStart: new Date().toISOString(),
            rentEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
            rentDuration: '1 month',
            paymentFrequency: 'monthly',
            unitNumber: `Unit ${i}`,
            isActive: true
        }, token);
    }
    console.log('   ✅ 4 tenants created.\n');
    // 5. Check stats again
    console.log('5️⃣  Checking stats after adding tenants...');
    const updatedStats = await api('GET', '/properties/stats', undefined, token);
    console.log(`   Stats: ${JSON.stringify(updatedStats)}`);
    const expectedRate = 40;
    if (updatedStats.occupiedUnits === 4 && updatedStats.vacantUnits === 6 && updatedStats.occupancyRate === expectedRate) {
        console.log('   ✅ Occupancy metrics verified!');
        console.log(`      - Occupied : ${updatedStats.occupiedUnits}`);
        console.log(`      - Vacant   : ${updatedStats.vacantUnits}`);
        console.log(`      - Rate     : ${updatedStats.occupancyRate}%\n`);
    }
    else {
        console.log('   ❌ Stats mismatch!');
        console.log(`      Expected: occupied=4, vacant=6, rate=40`);
        console.log(`      Actual:   occupied=${updatedStats.occupiedUnits}, vacant=${updatedStats.vacantUnits}, rate=${updatedStats.occupancyRate}\n`);
    }
    // 6. Check Dashboard endpoint as well
    console.log('6️⃣  Checking Dashboard endpoint for same metrics...');
    const dashboardData = await api('GET', '/dashboard', undefined, token);
    if (dashboardData.occupancyRate === expectedRate && dashboardData.occupiedUnits === 4) {
        console.log('   ✅ Dashboard occupancy metrics verified!\n');
    }
    else {
        console.log('   ❌ Dashboard metrics mismatch!\n');
    }
    console.log('🟢 ===== All Verification Tests Complete =====\n');
}
testOccupancy().catch((err) => {
    console.error('\n💥 Verification script crashed:', err.data ?? err.message);
    process.exit(1);
});
