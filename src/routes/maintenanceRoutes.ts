import { Router } from 'express';
import { getMaintenanceRecords, createMaintenanceRecord, getMaintenanceRecord } from '../controllers/maintenanceController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getMaintenanceRecords);
router.post('/', createMaintenanceRecord);
router.get('/:id', getMaintenanceRecord);

export default router;
