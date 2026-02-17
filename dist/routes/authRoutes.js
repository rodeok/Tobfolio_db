"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_js_1 = require("../controllers/authController.js");
const validationMiddleware_js_1 = require("../middleware/validationMiddleware.js");
const auth_schema_js_1 = require("../schemas/auth.schema.js");
const router = (0, express_1.Router)();
router.post('/register', (0, validationMiddleware_js_1.validate)(auth_schema_js_1.registerSchema), authController_js_1.register);
router.post('/login', (0, validationMiddleware_js_1.validate)(auth_schema_js_1.loginSchema), authController_js_1.login);
router.post('/google', authController_js_1.googleLogin); // Google login might have different validation
router.post('/forgot-password', (0, validationMiddleware_js_1.validate)(auth_schema_js_1.forgotPasswordSchema), authController_js_1.forgotPassword);
router.post('/reset-password', (0, validationMiddleware_js_1.validate)(auth_schema_js_1.resetPasswordSchema), authController_js_1.resetPassword);
exports.default = router;
