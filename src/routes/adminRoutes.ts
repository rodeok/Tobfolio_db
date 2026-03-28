import { Router } from 'express';
import {
    adminLogin,
    getAllUsers,
    toggleUserBan,
    toggleUserSuspend,
    deleteUser,
    createReward,
    updateReward,
    deleteReward,
    getAllRewards,
    getRedemptions,
    fulfillRedemption,
} from '../controllers/adminController.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations — users, rewards, and redemptions
 */

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: Admin login successful — returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', adminLogin);

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all registered users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin access required
 */
router.get('/users', adminMiddleware, getAllUsers);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/ban:
 *   patch:
 *     summary: Toggle user ban status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User ban status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User banned successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden
 */
router.patch('/users/:userId/ban', adminMiddleware, toggleUserBan);

/**
 * @swagger
 * /api/v1/admin/users/{userId}/suspend:
 *   patch:
 *     summary: Toggle user suspend (isActive) status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User suspend status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User suspended successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden
 */
router.patch('/users/:userId/suspend', adminMiddleware, toggleUserSuspend);

/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/users/:userId', adminMiddleware, deleteUser);

// ─── Reward Management ────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/admin/rewards:
 *   get:
 *     summary: Get all rewards (admin view — includes inactive)
 *     description: Returns all reward items in the catalogue including inactive ones. For the admin panel listing.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All rewards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reward'
 *       403:
 *         description: Forbidden
 */
router.get('/rewards', adminMiddleware, getAllRewards);

/**
 * @swagger
 * /api/v1/admin/rewards:
 *   post:
 *     summary: Create a new reward
 *     description: Admin uploads a new Tobfolio merch item (T-shirt, mug, etc.) with image, description, and required points.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, imageUrl, pointsRequired]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tobfolio T-Shirt
 *               description:
 *                 type: string
 *                 example: Premium 100% cotton tee with embroidered Tobfolio logo
 *               imageUrl:
 *                 type: string
 *                 example: https://res.cloudinary.com/tobfolio/image/upload/tshirt.jpg
 *                 description: Cloudinary or external image URL of the reward
 *               pointsRequired:
 *                 type: integer
 *                 example: 10
 *                 description: Number of referral points needed to redeem this reward
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Reward created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reward'
 *       403:
 *         description: Forbidden
 */
router.post('/rewards', adminMiddleware, createReward);

/**
 * @swagger
 * /api/v1/admin/rewards/{id}:
 *   put:
 *     summary: Update a reward
 *     description: Admin can update any field of an existing reward item — name, description, image, points, or active status.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               pointsRequired:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Reward updated
 *       404:
 *         description: Reward not found
 *       403:
 *         description: Forbidden
 */
router.put('/rewards/:id', adminMiddleware, updateReward);

/**
 * @swagger
 * /api/v1/admin/rewards/{id}:
 *   delete:
 *     summary: Delete a reward
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reward deleted
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.delete('/rewards/:id', adminMiddleware, deleteReward);

// ─── Redemption Management ────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/admin/redemptions:
 *   get:
 *     summary: Get all redemption requests
 *     description: Returns all redemption requests from landlords sorted by newest first. Includes the user's name/email and the reward name/image.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of redemptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Redemption'
 *       403:
 *         description: Forbidden
 */
router.get('/redemptions', adminMiddleware, getRedemptions);

/**
 * @swagger
 * /api/v1/admin/redemptions/{id}/fulfill:
 *   patch:
 *     summary: Mark a redemption as fulfilled
 *     description: Admin marks a pending redemption as fulfilled once the physical merch has been sent to the landlord.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Redemption fulfilled
 *       400:
 *         description: Redemption already fulfilled or cancelled
 *       404:
 *         description: Redemption not found
 *       403:
 *         description: Forbidden
 */
router.patch('/redemptions/:id/fulfill', adminMiddleware, fulfillRedemption);

export default router;
