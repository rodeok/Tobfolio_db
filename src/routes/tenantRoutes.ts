import { Router } from 'express';
import { getTenants, createTenant, getTenant, updateTenant, deleteTenant, renewTenant } from '../controllers/tenantController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Tenant management — create, read, update, renew, and evict tenants
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tenant:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique tenant ID
 *         name:
 *           type: string
 *           description: Full name of the tenant
 *         email:
 *           type: string
 *           description: Tenant email address
 *         phone:
 *           type: string
 *           description: Tenant phone number
 *         propertyId:
 *           type: object
 *           description: Populated property info
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *             address:
 *               type: string
 *             type:
 *               type: string
 *         unitNumber:
 *           type: string
 *           description: Unit/room number occupied by the tenant
 *         rentAmount:
 *           type: number
 *           description: Monthly or yearly rent fee
 *         rentStart:
 *           type: string
 *           format: date-time
 *           description: Date the lease started
 *         rentEnd:
 *           type: string
 *           format: date-time
 *           description: Date the lease expires
 *         rentDuration:
 *           type: string
 *           description: Human-readable lease duration (e.g. "1 year")
 *         paymentFrequency:
 *           type: string
 *           enum: [monthly, yearly]
 *           description: How often rent is due
 *         nextPaymentDate:
 *           type: string
 *           format: date-time
 *           description: Date of the next expected payment
 *         isActive:
 *           type: boolean
 *           description: Whether the tenant lease is currently active
 *         image:
 *           type: string
 *           description: Profile image URL
 *         createdAt:
 *           type: string
 *           format: date-time
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/tenants:
 *   get:
 *     summary: Get all tenants
 *     description: Returns all tenants belonging to the authenticated landlord. Each tenant's property details (title, address, type) are populated.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of tenant records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: Server error
 */
router.get('/', getTenants);

/**
 * @swagger
 * /api/v1/tenants:
 *   post:
 *     summary: Create a new tenant
 *     description: Creates a new tenant record and links it to a property owned by the authenticated landlord.
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
 *               - email
 *               - phone
 *               - propertyId
 *               - unitNumber
 *               - rentAmount
 *               - rentStart
 *               - rentEnd
 *               - rentDuration
 *               - paymentFrequency
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@email.com
 *               phone:
 *                 type: string
 *                 example: "08012345678"
 *               propertyId:
 *                 type: string
 *                 example: 64abc123def456
 *               unitNumber:
 *                 type: string
 *                 example: Flat 3B
 *               rentAmount:
 *                 type: number
 *                 example: 5000
 *               rentStart:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-01-01T00:00:00.000Z"
 *               rentEnd:
 *                 type: string
 *                 format: date-time
 *                 example: "2027-01-01T00:00:00.000Z"
 *               rentDuration:
 *                 type: string
 *                 example: 1 year
 *               paymentFrequency:
 *                 type: string
 *                 enum: [monthly, yearly]
 *                 example: monthly
 *               image:
 *                 type: string
 *                 description: Optional profile image URL
 *               notes:
 *                 type: string
 *                 description: Any additional notes about the tenant
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error creating tenant
 */
router.post('/', createTenant);

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   get:
 *     summary: Get a tenant's profile by ID
 *     description: Returns full profile information for a specific tenant. Includes name, email, phone, unit number, and rental property details — suitable for the mobile "View Profile" screen.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The tenant's MongoDB ID
 *     responses:
 *       200:
 *         description: Tenant profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getTenant);

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   put:
 *     summary: Update tenant details
 *     description: Updates any field on a tenant record. For lease renewal specifically, use the dedicated `/renew` endpoint instead.
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
 *               unitNumber:
 *                 type: string
 *               rentAmount:
 *                 type: number
 *               notes:
 *                 type: string
 *               image:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tenant not found or unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id', updateTenant);

/**
 * @swagger
 * /api/v1/tenants/{id}/renew:
 *   put:
 *     summary: Renew a tenant's lease
 *     description: |
 *       Renews the lease for a tenant. This endpoint is dedicated for the mobile app's **Renew** action.
 *       It updates the rent frequency, renewal start date, expiry date, and rent fee in a single call.
 *       The `nextPaymentDate` is automatically reset to the provided `rentStart`.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The tenant's MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentFrequency
 *               - rentStart
 *               - rentEnd
 *               - rentAmount
 *             properties:
 *               paymentFrequency:
 *                 type: string
 *                 enum: [monthly, yearly]
 *                 example: yearly
 *                 description: New rent frequency for the renewed lease
 *               rentStart:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-26T00:00:00.000Z"
 *                 description: Renewal (start) date of the new lease period
 *               rentEnd:
 *                 type: string
 *                 format: date-time
 *                 example: "2027-03-26T00:00:00.000Z"
 *                 description: Expiry date of the renewed lease
 *               rentAmount:
 *                 type: number
 *                 example: 22000
 *                 description: Updated rent fee (amount paid by tenant)
 *     responses:
 *       200:
 *         description: Lease renewed successfully — returns updated tenant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tenant not found or unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id/renew', renewTenant);

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   delete:
 *     summary: Evict a tenant
 *     description: |
 *       **Evicts** a tenant by permanently deleting both the tenant record and their associated user account (matched by email).
 *       This action is irreversible. Corresponds to the mobile app's **Evict** button.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The tenant's MongoDB ID
 *     responses:
 *       200:
 *         description: Tenant and associated user deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tenant and associated user deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tenant not found or unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteTenant);

export default router;
