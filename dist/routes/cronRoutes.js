"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cronController_js_1 = require("../controllers/cronController.js");
const router = (0, express_1.Router)();
// Middleware to verify the cron secret
const verifyCronSecret = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== process.env.CRON_SECRET) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
    next();
};
/**
 * @swagger
 * tags:
 *   name: Cron
 *   description: Automated background tasks
 */
/**
 * @swagger
 * /api/v1/cron/check-rentals:
 *   get:
 *     summary: Trigger rental check cron job
 *     tags: [Cron]
 *     security:
 *       - bearerAuth: []
 *     description: Requires CRON_SECRET as bearer token
 *     responses:
 *       200:
 *         description: Rental check initiated
 *       401:
 *         description: Unauthorized
 */
router.get('/check-rentals', verifyCronSecret, cronController_js_1.checkRentals);
exports.default = router;
