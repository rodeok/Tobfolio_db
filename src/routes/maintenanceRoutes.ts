import { Router } from 'express';
import { getMaintenanceRecords, createMaintenanceRecord, getMaintenanceRecord } from '../controllers/maintenanceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Maintenance
 *   description: Maintenance record management
 */

router.use(authMiddleware);

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
router.get('/', getMaintenanceRecords);

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
router.post('/', createMaintenanceRecord);

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
router.get('/:id', getMaintenanceRecord);

export default router;
