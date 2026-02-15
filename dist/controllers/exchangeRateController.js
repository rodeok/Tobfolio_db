"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExchangeRates = void 0;
const ExchangeRate_js_1 = __importDefault(require("@/models/ExchangeRate.js"));
const getExchangeRates = async (req, res) => {
    try {
        // Check for cached rates (valid for 12 hours)
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const cachedRates = await ExchangeRate_js_1.default.findOne({
            lastUpdated: { $gt: twelveHoursAgo }
        }).sort({ lastUpdated: -1 });
        if (cachedRates) {
            return res.json({
                success: true,
                rates: cachedRates.rates,
                cached: true,
                lastUpdated: cachedRates.lastUpdated
            });
        }
        const apiKey = process.env.EXCHANGE_RATE_API || "2e3059e29802676fd9a4f74722551096";
        if (!apiKey) {
            return res.status(500).json({ error: "API key not configured" });
        }
        const url = `https://api.exchangerate.host/live?access_key=${apiKey}&source=USD`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch exchange rates: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) {
            return res.status(500).json({ error: data.error?.info || "Failed to fetch rates from provider" });
        }
        // Cache the new rates
        await ExchangeRate_js_1.default.create({
            rates: data.quotes,
            lastUpdated: new Date()
        });
        res.json({
            ...data,
            cached: false
        });
    }
    catch (error) {
        console.error("Exchange rate fetch error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getExchangeRates = getExchangeRates;
