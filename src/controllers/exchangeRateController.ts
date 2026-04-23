import { Request, Response } from 'express';
import ExchangeRate from '../models/ExchangeRate.js';

export const getExchangeRates = async (req: Request, res: Response) => {
    try {
        // Check for cached rates (valid for 12 hours)
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const cachedRates = await ExchangeRate.findOne({
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
            console.warn("Exchange Rate API key not found in environment, using fallback.");
        }

        // Try HTTP if HTTPS fails, or just use HTTP as it's more compatible with free tier
        const url = `http://api.exchangerate.host/live?access_key=${apiKey}&source=USD`;
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Failed to fetch exchange rates: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                console.error("Exchange Rate API returned success:false", data.error);
                throw new Error(data.error?.info || "Failed to fetch rates from provider");
            }

            // The API returns rates in data.quotes for the 'live' endpoint
            const rates = data.quotes || data.rates;

            if (!rates) {
                throw new Error("No rates found in API response");
            }

            // Cache the new rates
            await ExchangeRate.create({
                rates,
                lastUpdated: new Date()
            });

            return res.json({
                success: true,
                rates,
                cached: false,
                lastUpdated: new Date()
            });
        } catch (fetchError: any) {
            console.error("Exchange rate external fetch failed, attempting fallback to latest cache:", fetchError.message);
            
            // Final fallback: try to get ANY cached rates regardless of age
            const anyCachedRates = await ExchangeRate.findOne().sort({ lastUpdated: -1 });
            
            if (anyCachedRates) {
                return res.json({
                    success: true,
                    rates: anyCachedRates.rates,
                    cached: true,
                    lastUpdated: anyCachedRates.lastUpdated,
                    isFallback: true,
                    error: fetchError.message
                });
            }
            
            throw fetchError; // Re-throw to be caught by outer catch block
        }
    } catch (error: any) {
        console.error("Critical Exchange Rate Error:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Internal server error while fetching exchange rates",
            error: error.message 
        });
    }
};
