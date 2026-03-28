"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_js_1 = require("../controllers/aiController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered property management assistant (powered by Groq LLaMA)
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     AIChatRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: The landlord's question or prompt to the AI assistant
 *           example: How much profit am I making this month?
 *
 *     AIChatResponse:
 *       type: object
 *       properties:
 *         reply:
 *           type: string
 *           description: The AI assistant's response based on the landlord's dashboard data
 *           example: "Based on your dashboard data, your net balance (profit) is $4,820.00 after $180.00 in maintenance costs."
 */
/**
 * @swagger
 * /api/v1/ai/chat:
 *   post:
 *     summary: Chat with the AI property assistant
 *     description: |
 *       Sends a message to the Tobfolio AI assistant (powered by **Groq LLaMA 3.3**).
 *       The assistant has real-time context about the landlord's dashboard, including:
 *       - Total Income
 *       - Net Balance / Profit
 *       - Total Maintenance Costs
 *       - Number of Properties and Tenants
 *       - Active Tenants count
 *       - Value of Expired Rent
 *
 *       The assistant will only answer questions related to the landlord's property management data.
 *       Unrelated questions are politely declined.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIChatRequest'
 *           examples:
 *             profit:
 *               summary: Ask about profit
 *               value:
 *                 message: How much profit am I making?
 *             tenants:
 *               summary: Ask about tenants
 *               value:
 *                 message: How many active tenants do I have?
 *             maintenance:
 *               summary: Ask about maintenance costs
 *               value:
 *                 message: What are my total maintenance costs?
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIChatResponse'
 *       400:
 *         description: Bad request — message field is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message is required
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: AI service error (Groq API failure)
 */
router.post('/chat', authMiddleware_js_1.authMiddleware, aiController_js_1.chat);
exports.default = router;
