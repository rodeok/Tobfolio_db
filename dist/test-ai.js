"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:5000/api/v1';
async function testAI() {
    try {
        console.log('--- Starting AI Endpoint Test ---');
        // 1. Register a test user
        const testUser = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            role: 'landlord'
        };
        console.log('Registering test user...');
        await axios_1.default.post(`${BASE_URL}/auth/register`, testUser);
        console.log('User registered.');
        console.log('Logging in...');
        const loginRes = await axios_1.default.post(`${BASE_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        const token = loginRes.data.token;
        console.log('Token obtained.');
        // 2. Add a test property
        console.log('Adding test property...');
        const propRes = await axios_1.default.post(`${BASE_URL}/properties`, {
            name: 'Test Mansion',
            address: '123 AI Street',
            type: 'Mansion',
            size: '5000 sqft',
            estimatedValue: 1000000
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const propertyId = propRes.data._id;
        // 3. Add a test tenant
        console.log('Adding test tenant...');
        await axios_1.default.post(`${BASE_URL}/tenants`, {
            propertyId,
            name: 'AI Tenant',
            email: 'tenant@ai.com',
            phone: '1234567890',
            rentAmount: 5000,
            rentStart: new Date(),
            rentEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
            rentDuration: '1 year',
            paymentFrequency: 'Monthly',
            unitNumber: 'A1'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // 4. Test AI Chat
        console.log('Testing AI Chat...');
        const aiRes = await axios_1.default.post(`${BASE_URL}/ai/chat`, {
            message: 'How much profit am I making?'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('AI Reply:', aiRes.data.reply);
        console.log('--- Test Completed Successfully ---');
    }
    catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}
testAI();
