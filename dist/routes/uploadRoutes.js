"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uploadController_js_1 = require("../controllers/uploadController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload operations
 */
/**
 * @swagger
 * /api/v1/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware_js_1.authMiddleware, upload.single('file'), uploadController_js_1.uploadFile);
exports.default = router;
