import { Router } from 'express';
import { getMaintenanceRecords, createMaintenanceRecord, getMaintenanceRecord } from '../controllers/maintenanceController';
import { authMiddleware } from '../middleware/authMiddleware';

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
 *               - title
 *               - cost
 *             properties:
 *               propertyId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               cost:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED]
 *     responses:
 *       201:
 *         description: Maintenance record created successfully
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
 *       404:
 *         description: Maintenance record not found
 */
router.get('/:id', getMaintenanceRecord);

export default router;
