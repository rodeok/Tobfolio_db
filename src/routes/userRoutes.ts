import { Router } from 'express';
import { getProfile, updateProfile, updatePassword, deleteAccount, updateCurrency } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile management
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /api/v1/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               about:
 *                 type: string
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR, GBP, NGN, CAD, GHS, RWF]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', updateProfile);

/**
 * @swagger
 * /api/v1/user/password:
 *   put:
 *     summary: Update user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid password
 *       401:
 *         description: Unauthorized
 */
router.put('/password', updatePassword);

/**
 * @swagger
 * /api/v1/user/delete:
 *   delete:
 *     summary: Delete user account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/delete', deleteAccount);

/**
 * @swagger
 * /api/v1/user/currency:
 *   put:
 *     summary: Update user preferred currency
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR, GBP, NGN, CAD, GHS, RWF]
 *     responses:
 *       200:
 *         description: Currency updated successfully
 *       400:
 *         description: Invalid currency
 *       401:
 *         description: Unauthorized
 */
router.put('/currency', updateCurrency);

export default router;
