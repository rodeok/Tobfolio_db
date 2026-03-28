"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const handymanController_js_1 = require("../controllers/handymanController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Handymen
 *   description: Handyman (artisan) profiles and reviews
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Handyman:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique handyman ID
 *         fullName:
 *           type: string
 *           description: Full name of the handyman
 *           example: Emeka the Plumber
 *         expertise:
 *           type: string
 *           description: Trade/skill category
 *           example: Plumbing
 *         location:
 *           type: string
 *           description: City or area the handyman operates in
 *           example: Lagos
 *         description:
 *           type: string
 *           description: Short bio or description of services offered
 *           example: Expert plumber with 10 years of experience
 *         time:
 *           type: string
 *           enum: [12hrs, 24hrs]
 *           description: Handyman availability timeframe
 *           example: 24hrs
 *         phoneNumber:
 *           type: string
 *           example: "08098765432"
 *         whatsappNumber:
 *           type: string
 *           example: "08098765432"
 *         email:
 *           type: string
 *           example: "emeka@example.com"
 *         rating:
 *           type: number
 *           description: Average rating calculated from reviews (0-5)
 *           example: 4.5
 *         reviewsCount:
 *           type: integer
 *           description: Total number of reviews left for this handyman
 *           example: 12
 *         image:
 *           type: string
 *           description: Profile image URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         handymanId:
 *           type: string
 *         userId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 4
 *         comment:
 *           type: string
 *           example: Very professional and on time.
 *         createdAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/v1/handymen:
 *   get:
 *     summary: Get all handymen
 *     description: |
 *       Returns a list of all handymen, sorted by rating (highest first).
 *       Supports optional query filters: `expertise`, `location`, and `search` (searches fullName, expertise, and description).
 *     tags: [Handymen]
 *     parameters:
 *       - in: query
 *         name: expertise
 *         schema:
 *           type: string
 *         description: Filter by trade expertise (e.g. Plumbing, Electrical)
 *         example: Plumbing
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by city or area
 *         example: Lagos
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Full-text search across fullName, expertise, and description
 *         example: plumber
 *     responses:
 *       200:
 *         description: Array of handyman profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Handyman'
 *       500:
 *         description: Server error
 */
router.get('/', handymanController_js_1.getHandymen);
/**
 * @swagger
 * /api/v1/handymen:
 *   post:
 *     summary: Create a handyman profile
 *     description: Registers a new handyman (artisan) in the directory.
 *     tags: [Handymen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - expertise
 *               - location
 *               - description
 *               - time
 *               - phoneNumber
 *               - email
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Emeka the Plumber
 *               expertise:
 *                 type: string
 *                 example: Plumbing
 *               location:
 *                 type: string
 *                 example: Lagos
 *               description:
 *                 type: string
 *                 example: Expert plumber with 10 years of experience in residential repairs.
 *               time:
 *                 type: string
 *                 enum: [12hrs, 24hrs]
 *                 example: 24hrs
 *               phoneNumber:
 *                 type: string
 *                 example: "08098765432"
 *               whatsappNumber:
 *                 type: string
 *                 example: "08098765432"
 *               email:
 *                 type: string
 *                 example: "emeka@example.com"
 *               image:
 *                 type: string
 *                 description: Optional profile image URL
 *     responses:
 *       201:
 *         description: Handyman profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Handyman'
 *       500:
 *         description: Error creating handyman
 */
router.post('/', handymanController_js_1.createHandyman);
/**
 * @swagger
 * /api/v1/handymen/{id}:
 *   get:
 *     summary: Get a handyman's profile and reviews
 *     description: Returns full profile details for a handyman along with all their associated reviews (reviewer name populated).
 *     tags: [Handymen]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The handyman's MongoDB ID
 *     responses:
 *       200:
 *         description: Handyman profile and reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 handyman:
 *                   $ref: '#/components/schemas/Handyman'
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *       404:
 *         description: Handyman not found
 *       500:
 *         description: Server error
 */
router.get('/:id', handymanController_js_1.getHandymanById);
/**
 * @swagger
 * /api/v1/handymen/{id}/reviews:
 *   post:
 *     summary: Add a review for a handyman
 *     description: |
 *       Submits a rating and optional comment for a handyman. Requires authentication.
 *       After a review is added, the handyman's average rating and total review count are automatically recalculated.
 *     tags: [Handymen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The handyman's MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *                 description: Star rating from 1 to 5
 *               comment:
 *                 type: string
 *                 example: Great work! Fixed my pipe in 30 minutes.
 *                 description: Optional review comment
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized — login required to leave a review
 *       500:
 *         description: Server error
 */
router.post('/:id/reviews', authMiddleware_js_1.authMiddleware, handymanController_js_1.addReview);
exports.default = router;
