"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_js_1 = require("@/controllers/notificationController.js");
const authMiddleware_js_1 = require("@/middleware/authMiddleware.js");
const router = (0, express_1.Router)();
router.post('/send', authMiddleware_js_1.authMiddleware, notificationController_js_1.sendNotification);
exports.default = router;
