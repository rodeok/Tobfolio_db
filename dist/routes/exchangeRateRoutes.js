"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exchangeRateController_js_1 = require("../controllers/exchangeRateController.js");
const router = (0, express_1.Router)();
router.get('/', exchangeRateController_js_1.getExchangeRates);
exports.default = router;
