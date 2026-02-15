import { Router } from 'express';
import { sendNotification } from '@/controllers/notificationController.js';
import { authMiddleware } from '@/middleware/authMiddleware.js';

const router = Router();

router.post('/send', authMiddleware, sendNotification);

export default router;
