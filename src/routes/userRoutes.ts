import { Router } from 'express';
import { updateProfile, updatePassword, deleteAccount } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.delete('/delete', deleteAccount);

export default router;
