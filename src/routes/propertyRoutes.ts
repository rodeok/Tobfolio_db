import { Router } from 'express';
import { getProperties, createProperty, getProperty, updateProperty, deleteProperty, getRentalStats } from '../controllers/propertyController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Property management
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getProperties);

/**
 * @swagger
 * /api/v1/properties/stats:
 *   get:
 *     summary: Get rental occupancy statistics
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rental statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 occupancyRate:
 *                   type: number
 *                 occupiedUnits:
 *                   type: number
 *                 vacantUnits:
 *                   type: number
 *                 totalUnits:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getRentalStats);

/**
 * @swagger
 * /api/v1/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/PropertySingleUnit'
 *               - $ref: '#/components/schemas/PropertyEntireBuilding'
 *     responses:
 *       201:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       401:
 *         description: Unauthorized
 */
router.post('/', createProperty);

  /**
   * @swagger
   * /api/v1/properties/{id}:
   *   get:
   *     summary: Get property by ID
   *     tags: [Properties]
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
   *         description: Property details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Property'
   *       404:
   *         description: Property not found
   *   put:
   *     summary: Update a property
   *     description: All fields are optional. Only send the fields you want to update, including unit fields (unitType, unitNumber, totalUnits, unitDescription, managementType).
   *     tags: [Properties]
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
   *             $ref: '#/components/schemas/PropertyUpdate'
   *     responses:
   *       200:
   *         description: Property updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Property'
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - You do not have permission to update this property
   *       404:
   *         description: Property not found
   *   delete:
   *     summary: Delete a property
   *     tags: [Properties]
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
   *         description: Property deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Property deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - You do not have permission to delete this property
   *       404:
   *         description: Property not found
   */
router.get('/:id', getProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

export default router;
