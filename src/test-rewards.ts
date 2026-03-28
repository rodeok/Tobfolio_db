import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api/v1';

async function api(
    method: string,
    path: string,
    body?: object,
    token?: string
): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
        const err: any = new Error(`HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

async function testRewards() {
    console.log('\n🔵 ===== Referral & Rewards System Tests =====\n');

    try {
        // ── 1. Register Landlord A (Referrer) ────────────────────────
        console.log('1️⃣  Registering Landlord A...');
        const landlordA = {
            name: 'Alice Referrer',
            email: `alice${Date.now()}@test.com`,
            password: 'password123',
        };
        const regA = await api('POST', '/auth/register', landlordA);
        const referralCodeA = regA.referralCode;
        console.log(`   ✅ Landlord A registered. Referral Code: ${referralCodeA}\n`);

        // Get Landlord A's token
        const loginA = await api('POST', '/auth/login', {
            email: landlordA.email,
            password: landlordA.password,
        });
        const tokenA = loginA.token;

        // Verify initial points
        const myInfoInitial = await api('GET', '/rewards/me', undefined, tokenA);
        console.log(`   ℹ️  Landlord A initial points: ${myInfoInitial.referralPoints}\n`);

        // ── 2. Register Landlord B (Referee) ─────────────────────────
        console.log('2️⃣  Registering Landlord B using Landlord A\'s code...');
        const landlordB = {
            name: 'Bob Referee',
            email: `bob${Date.now()}@test.com`,
            password: 'password123',
            referralCode: referralCodeA, // Use Alice's code
        };
        await api('POST', '/auth/register', landlordB);
        console.log(`   ✅ Landlord B registered using code ${referralCodeA}.\n`);

        // ── 3. Verify Landlord A earned points ───────────────────────
        console.log('3️⃣  Verifying Landlord A earned 1 point...');
        const myInfoUpdated = await api('GET', '/rewards/me', undefined, tokenA);
        if (myInfoUpdated.referralPoints === 1) {
            console.log('   ✅ Point awarded correctly. Current points: 1\n');
        } else {
            console.log(`   ❌ Points mismatch! Expected 1, got ${myInfoUpdated.referralPoints}\n`);
            throw new Error("Points not awarded");
        }

        // ── 4. Admin Login & Reward Creation ─────────────────────────
        console.log('4️⃣  Admin logging in and creating a reward...');
        const adminLogin = await api('POST', '/admin/login', {
            username: process.env.ADMIN_USERNAME || 'admin',
            password: process.env.ADMIN_PASSWORD || 'securepassword123',
        });
        const adminToken = adminLogin.token;

        const newReward = {
            name: `Test T-Shirt ${Date.now()}`,
            description: 'A very nice test t-shirt',
            imageUrl: 'https://example.com/tshirt.png',
            pointsRequired: 1, // Only 1 point needed so Alice can redeem it
        };
        const createdReward = await api('POST', '/admin/rewards', newReward, adminToken);
        const rewardId = createdReward._id;
        console.log(`   ✅ Reward created. ID: ${rewardId}, Points Required: ${createdReward.pointsRequired}\n`);

        // ── 5. Landlord A browses rewards ────────────────────────────
        console.log('5️⃣  Landlord A browsing active rewards...');
        const activeRewards = await api('GET', '/rewards', undefined, tokenA);
        const foundReward = activeRewards.find((r: any) => r._id === rewardId);
        if (foundReward) {
            console.log(`   ✅ Reward found in catalogue: "${foundReward.name}"\n`);
        } else {
            console.log('   ❌ Reward not found in catalogue!\n');
            throw new Error("Reward not found");
        }

        // ── 6. Landlord A redeems reward ─────────────────────────────
        console.log('6️⃣  Landlord A redeeming the reward...');
        const redeemRes = await api('POST', `/rewards/${rewardId}/redeem`, undefined, tokenA);
        console.log(`   ✅ Redemption successful! Remaining points: ${redeemRes.remainingPoints}`);
        const redemptionId = redeemRes.redemption._id;
        console.log(`      Redemption ID: ${redemptionId}\n`);

        // ── 7. Admin lists & fulfills redemption ─────────────────────
        console.log('7️⃣  Admin checking redemptions and fulfilling...');
        const allRedemptions = await api('GET', '/admin/redemptions', undefined, adminToken);
        const foundRedemption = allRedemptions.find((r: any) => r._id === redemptionId);
        
        if (foundRedemption && foundRedemption.status === 'pending') {
            console.log('   ✅ Pending redemption found by admin.');
            
            // Fulfill it
            const fulfillRes = await api('PATCH', `/admin/redemptions/${redemptionId}/fulfill`, undefined, adminToken);
            console.log(`   ✅ Redemption fulfilled! Status is now: ${fulfillRes.redemption.status}\n`);
        } else {
            console.log('   ❌ Pending redemption not found by admin!\n');
            throw new Error("Redemption not found or not pending");
        }

        console.log('🟢 ===== All Referral & Rewards Tests PASSED =====\n');

    } catch (err: any) {
        console.error('\n💥 Test script crashed:', err.data ?? err.message ?? err);
        process.exit(1);
    }
}

testRewards();
