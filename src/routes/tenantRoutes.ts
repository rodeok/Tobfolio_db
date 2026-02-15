import { Router } from 'express';
import { getTenants, createTenant, getTenant, updateTenant, deleteTenant } from '../controllers/tenantController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getTenants);
router.post('/', createTenant);
router.get('/:id', getTenant);
router.put('/:id', updateTenant);
router.delete('/:id', deleteTenant);

export default router;
