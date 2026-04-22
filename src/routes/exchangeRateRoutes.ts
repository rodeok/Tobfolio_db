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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rates:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                 cached:
 *                   type: boolean
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 */
router.get('/', getExchangeRates);

export default router;
