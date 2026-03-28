"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const BASE_URL = 'http://localhost:5000/api/v1';
// Helper: make HTTP requests using native fetch
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
async function testTenantUpdates() {
    console.log('\n🔵 ===== Tenant Backend Update Tests =====\n');
    // ── 1. Register landlord ──────────────────────────────────────
    const landlord = {
        name: 'Landlord Joe',
        email: `landlord${Date.now()}@test.com`,
        password: 'password123',
    };
    console.log('1️⃣  Registering landlord...');
    await api('POST', '/auth/register', landlord);
    const loginData = await api('POST', '/auth/login', {
        email: landlord.email,
        password: landlord.password,
    });
    const token = loginData.token;
    console.log('   ✅ Landlord registered & logged in. Token obtained.\n');
    // ── 2. Add a property ─────────────────────────────────────────
    console.log('2️⃣  Creating test property...');
    const property = await api('POST', '/properties', {
        title: 'Test Villa',
        address: '456 Test Lane',
        type: 'Villa',
        size: '2000 sqft',
        estimatedValue: 500000,
    }, token);
    const propertyId = property._id;
    console.log(`   ✅ Property created. ID: ${propertyId}\n`);
    // ── 3. Register a system user for the "tenant" ────────────────
    const tenantUser = {
        name: 'Tenant Smith',
        email: `tenant${Date.now()}@test.com`,
        password: 'password123',
    };
    console.log('3️⃣  Registering tenant as a system user...');
    await api('POST', '/auth/register', tenantUser);
    console.log(`   ✅ System user created: ${tenantUser.email}\n`);
    // ── 4. Create tenant record ───────────────────────────────────
    console.log('4️⃣  Creating tenant record...');
    const tenant = await api('POST', '/tenants', {
        propertyId,
        name: tenantUser.name,
        email: tenantUser.email,
        phone: '08012345678',
        rentAmount: 2000,
        rentStart: new Date().toISOString(),
        rentEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        rentDuration: '1 month',
        paymentFrequency: 'monthly',
        unitNumber: 'Flat 1',
    }, token);
    const tenantId = tenant._id;
    console.log(`   ✅ Tenant record created. ID: ${tenantId}\n`);
    // ── 5. Test RENEW endpoint ────────────────────────────────────
    console.log('5️⃣  Testing RENEW (PUT /tenants/:id/renew)...');
    const renewed = await api('PUT', `/tenants/${tenantId}/renew`, {
        paymentFrequency: 'yearly',
        rentStart: new Date().toISOString(),
        rentEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
        rentAmount: 22000,
    }, token);
    if (renewed.paymentFrequency === 'yearly' && renewed.rentAmount === 22000) {
        console.log('   ✅ RENEW test PASSED.');
        console.log(`      - New frequency : ${renewed.paymentFrequency}`);
        console.log(`      - New rent amt  : ${renewed.rentAmount}`);
        console.log(`      - New start     : ${new Date(renewed.rentStart).toLocaleDateString()}`);
        console.log(`      - New expiry    : ${new Date(renewed.rentEnd).toLocaleDateString()}\n`);
    }
    else {
        console.log('   ❌ RENEW test FAILED: returned data mismatch\n');
        console.log(renewed);
    }
    // ── 6. Test EVICT endpoint ────────────────────────────────────
    console.log('6️⃣  Testing EVICT (DELETE /tenants/:id)...');
    const evictRes = await api('DELETE', `/tenants/${tenantId}`, undefined, token);
    console.log(`   Response: "${evictRes.message}"`);
    // Verify tenant is gone
    try {
        await api('GET', `/tenants/${tenantId}`, undefined, token);
        console.log('   ❌ EVICT test FAILED: Tenant record still exists.\n');
    }
    catch (err) {
        if (err.status === 404) {
            console.log('   ✅ EVICT test PASSED: Tenant record deleted.\n');
        }
        else {
            console.log(`   ⚠️  Unexpected status ${err.status}: ${JSON.stringify(err.data)}\n`);
        }
    }
    // Verify associated user is gone – try to login with the evicted user's creds
    console.log('7️⃣  Verifying associated User account was also deleted...');
    try {
        await api('POST', '/auth/login', {
            email: tenantUser.email,
            password: tenantUser.password,
        });
        console.log('   ❌ User STILL EXISTS — eviction did not delete the user account.\n');
    }
    catch (err) {
        if (err.status === 401 || err.status === 404 || err.status === 400) {
            console.log('   ✅ User account deleted — login rejected as expected.\n');
        }
        else {
            console.log(`   ⚠️  Unexpected status ${err.status}: ${JSON.stringify(err.data)}\n`);
        }
    }
    console.log('🟢 ===== All Tests Complete =====\n');
}
testTenantUpdates().catch((err) => {
    console.error('\n💥 Test script crashed:', err.data ?? err.message);
    process.exit(1);
});
