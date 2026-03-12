import { Router } from 'express';
import { getExchangeRates } from '../controllers/exchangeRateController.js';

const router = Router();

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
router.get('/', getExchangeRates);

export default router;
