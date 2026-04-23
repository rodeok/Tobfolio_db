import jwt from 'jsonwebtoken';
import fetch from 'node-fetch'; // wait, no node-fetch, just use native fetch

async function testProfile() {
    const token = jwt.sign({ userId: '65f1a2b3c4d5e6f7a8b9c0d1' }, process.env.JWT_SECRET || 'secret');
    console.log("Testing with token:", token);
    
    try {
        const response = await fetch("http://localhost:5000/api/v1/user/profile", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}

testProfile();
