import { Router } from 'express';
import { getExchangeRates } from '../controllers/exchangeRateController.js';

const router = Router();

router.get('/', getExchangeRates);

export default router;
