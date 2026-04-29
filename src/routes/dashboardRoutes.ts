import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics and data
 */

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userName: { type: string }
 *                 totalIncome: { type: number }
 *                 incomeGrowth: { type: number }
 *                 totalRentals: { type: number }
 *                 netBalance: { type: number }
 *                 maintenance: { type: number }
 *                 totalUnits: { type: number }
 *                 occupiedUnits: { type: number }
 *                 vacantUnits: { type: number }
 *                 occupancyRate: { type: number }
 *                 chartData: { type: array, items: { type: object } }
 *                 lastUpdated: { type: string }
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, getDashboardData);

export default router;
