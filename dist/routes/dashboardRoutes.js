"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboardController_js_1 = require("../controllers/dashboardController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = express_1.default.Router();
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
router.get('/', authMiddleware_js_1.authMiddleware, dashboardController_js_1.getDashboardData);
exports.default = router;
