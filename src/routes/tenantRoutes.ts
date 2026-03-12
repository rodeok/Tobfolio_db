import { Router } from 'express';
import { getTenants, createTenant, getTenant, updateTenant, deleteTenant } from '../controllers/tenantController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Tenant management
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/tenants:
 *   get:
 *     summary: Get all tenants
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tenants
 *       401:
 *         description: Unauthorized
 */
router.get('/', getTenants);

/**
 * @swagger
 * /api/v1/tenants:
 *   post:
 *     summary: Create a new tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - propertyId
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               propertyId:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               rentAmount:
 *                 type: number
 *               leaseStart:
 *                 type: string
 *               leaseEnd:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', createTenant);

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   get:
 *     summary: Get tenant by ID
 *     tags: [Tenants]
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
 *         description: Tenant details
 *       404:
 *         description: Tenant not found
 */
router.get('/:id', getTenant);

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   put:
 *     summary: Update a tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *               rentAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tenant not found
 */
router.put('/:id', updateTenant);

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   delete:
 *     summary: Delete a tenant
 *     tags: [Tenants]
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
 *         description: Tenant deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tenant not found
 */
router.delete('/:id', deleteTenant);

export default router;
