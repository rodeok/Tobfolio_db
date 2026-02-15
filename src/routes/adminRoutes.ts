import { Router } from 'express';
import { adminLogin, getAllUsers, toggleUserBan, deleteUser } from '@/controllers/adminController.js';
import { adminMiddleware } from '@/middleware/adminMiddleware.js';

const router = Router();

router.post('/login', adminLogin);
router.get('/users', adminMiddleware, getAllUsers);
router.patch('/users/:userId/ban', adminMiddleware, toggleUserBan);
router.delete('/users/:userId', adminMiddleware, deleteUser);

export default router;
