import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

/**
 * This script tests the Google Mobile Auth endpoint.
 * Since real ID tokens are short-lived and generated on the device,
 * this script primarily verifies the endpoint's availability and error handling.
 * 
 * To test with a real token:
 * npm run test:google <YOUR_ID_TOKEN>
 */

async function testGoogleAuth() {
    const idToken = process.argv[2];

    if (!idToken) {
        console.log('\n⚠️  No ID Token provided.');
        console.log('Usage: npx tsx src/test-google-auth.ts <id_token>\n');
        console.log('Testing endpoint availability with an invalid token...');
    }

    try {
        console.log(`Connecting to: ${BASE_URL}/auth/google-mobile`);
        
        const response = await fetch(`${BASE_URL}/auth/google-mobile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idToken: idToken || 'invalid-token-for-testing'
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Success!');
            console.log('User Data:', data.user);
            console.log('JWT Token:', data.token);
        } else {
            console.log('❌ Failed as expected (unless you provided a valid token)');
            console.log('Status:', response.status);
            console.log('Response:', data);
        }
    } catch (error: any) {
        console.error('❌ Network Error:', error.message);
        console.log('Make sure your backend server is running at', BASE_URL);
    }
}

testGoogleAuth();
