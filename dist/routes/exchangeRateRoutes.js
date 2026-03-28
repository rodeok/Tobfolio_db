"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exchangeRateController_js_1 = require("../controllers/exchangeRateController.js");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Exchange Rates
 *   description: Currency exchange rate information
 */
/**
 * @swagger
 * /api/v1/exchange-rates:
 *   get:
 *     summary: Get current exchange rates
 *     tags: [Exchange Rates]
 *     responses:
 *       200:
 *         description: Exchange rate data
 */
router.get('/', exchangeRateController_js_1.getExchangeRates);
exports.default = router;
