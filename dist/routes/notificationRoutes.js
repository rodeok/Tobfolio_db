"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_js_1 = require("../controllers/notificationController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */
/**
 * @swagger
 * /api/v1/notifications/send:
 *   post:
 *     summary: Send a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification sent successful
 *       401:
 *         description: Unauthorized
 */
router.post('/send', authMiddleware_js_1.authMiddleware, notificationController_js_1.sendNotification);
exports.default = router;
