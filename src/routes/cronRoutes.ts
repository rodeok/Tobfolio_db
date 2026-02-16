import { Router, Request, Response, NextFunction } from 'express';
import { checkRentals } from '../controllers/cronController.js';

const router = Router();

// Middleware to verify the cron secret
const verifyCronSecret = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.CRON_SECRET) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }

    next();
};

router.get('/check-rentals', verifyCronSecret, checkRentals);

export default router;
