import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api/v1';

async function verifyFix() {
    try {
        console.log('--- Verifying Property Creation Fix ---');

        // 1. Login to get token (using credentials from previous test context or env)
        // Since I don't have a specific test user's password here, I'll register a new one.
        const testUser = {
            name: 'Verification User',
            email: `verify${Date.now()}@example.com`,
            password: 'password123'
        };

        console.log('Registering test user...');
        await axios.post(`${BASE_URL}/auth/register`, testUser);
        
        console.log('Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        const token = loginRes.data.token;

        // 2. Test property creation with the exact payload from the screenshot
        const payload = {
            "name": "house",
            "type": "bungalo",
            "address": "Lagos island",
            "units": 3
        };

        console.log('Sending property creation request with payload:', payload);
        const res = await axios.post(`${BASE_URL}/properties`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Response Status:', res.status);
        console.log('Response Body:', JSON.stringify(res.data, null, 2));

        if (res.status === 201 && res.data.name === 'house' && res.data.units === 3) {
            console.log('✅ SUCCESS: Property created with name and units!');
        } else {
            console.log('❌ FAILURE: Response data mismatch.');
        }

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.response?.data || error.message);
    }
}

verifyFix();
