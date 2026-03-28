"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rewardController_js_1 = require("../controllers/rewardController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
router.use(authMiddleware_js_1.authMiddleware);
/**
 * @swagger
 * tags:
 *   name: Rewards
 *   description: Referral points and merchandise rewards
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Reward:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: Tobfolio T-Shirt
 *         description:
 *           type: string
 *           example: Premium cotton tee with the Tobfolio logo
 *         imageUrl:
 *           type: string
 *           example: https://res.cloudinary.com/tobfolio/image/upload/tshirt.jpg
 *         pointsRequired:
 *           type: integer
 *           example: 10
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Redemption:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         rewardId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             imageUrl:
 *               type: string
 *         pointsSpent:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [pending, fulfilled, cancelled]
 *         createdAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/v1/rewards:
 *   get:
 *     summary: Browse all available rewards
 *     description: Returns all active rewards in the Tobfolio merch catalogue, sorted by points required (lowest first).
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active rewards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reward'
 *       401:
 *         description: Unauthorized
 */
router.get('/', rewardController_js_1.getRewards);
/**
 * @swagger
 * /api/v1/rewards/me:
 *   get:
 *     summary: Get my referral info and points
 *     description: |
 *       Returns the logged-in landlord's:
 *       - **referralCode** — their unique invite code
 *       - **referralPoints** — total accumulated points
 *       - **referralLink** — full invite URL to share (e.g. `https://www.tobfolio.com/register?ref=ABCD1234`)
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 referralCode:
 *                   type: string
 *                   example: ABCD1234
 *                 referralPoints:
 *                   type: integer
 *                   example: 5
 *                 referralLink:
 *                   type: string
 *                   example: https://www.tobfolio.com/register?ref=ABCD1234
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/me', rewardController_js_1.getMyReferralInfo);
/**
 * @swagger
 * /api/v1/rewards/{id}/redeem:
 *   post:
 *     summary: Redeem a reward
 *     description: |
 *       Allows a landlord to redeem a merchandise reward using their referral points.
 *       - Verifies the landlord has enough points.
 *       - Deducts the required points from their balance.
 *       - Creates a **Redemption** record with status `pending` for admin to fulfill.
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reward ID to redeem
 *     responses:
 *       201:
 *         description: Redemption successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Redemption successful! We will process your reward shortly.
 *                 remainingPoints:
 *                   type: integer
 *                   example: 3
 *                 redemption:
 *                   $ref: '#/components/schemas/Redemption'
 *       400:
 *         description: Insufficient points
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reward not found or no longer available
 */
router.post('/:id/redeem', rewardController_js_1.redeemReward);
exports.default = router;
