"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const maintenanceController_js_1 = require("../controllers/maintenanceController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Maintenance
 *   description: Maintenance record management
 */
router.use(authMiddleware_js_1.authMiddleware);
/**
 * @swagger
 * /api/v1/maintenance:
 *   get:
 *     summary: Get all maintenance records
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of maintenance records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Maintenance'
 *       401:
 *         description: Unauthorized
 */
router.get('/', maintenanceController_js_1.getMaintenanceRecords);
/**
 * @swagger
 * /api/v1/maintenance:
 *   post:
 *     summary: Create a new maintenance record
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - type
 *               - cost
 *             properties:
 *               propertyId:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               cost:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Completed, Cancelled]
 *     responses:
 *       201:
 *         description: Maintenance record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Maintenance'
 *       401:
 *         description: Unauthorized
 */
router.post('/', maintenanceController_js_1.createMaintenanceRecord);
/**
 * @swagger
 * /api/v1/maintenance/{id}:
 *   get:
 *     summary: Get maintenance record by ID
 *     tags: [Maintenance]
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
 *         description: Maintenance record details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Maintenance'
 *       404:
 *         description: Maintenance record not found
 */
router.get('/:id', maintenanceController_js_1.getMaintenanceRecord);
exports.default = router;
