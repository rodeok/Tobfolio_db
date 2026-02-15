"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cronController_js_1 = require("@/controllers/cronController.js");
const router = (0, express_1.Router)();
// In a real scenario, this would be protected by a secret key or fixed dynamic route
router.get('/check-rentals', cronController_js_1.checkRentals);
exports.default = router;
