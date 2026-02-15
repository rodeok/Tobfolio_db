import { Router } from 'express';
import { checkRentals } from '../controllers/cronController.js';

const router = Router();

// In a real scenario, this would be protected by a secret key or fixed dynamic route
router.get('/check-rentals', checkRentals);

export default router;
