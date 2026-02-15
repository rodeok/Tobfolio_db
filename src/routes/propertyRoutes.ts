import { Router } from 'express';
import { getProperties, createProperty, getProperty, deleteProperty } from '../controllers/propertyController.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import Maintenance from '../models/Maintenance.js';
import { propertySchema } from '../utils/validations.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getProperties);
router.post('/', createProperty);
router.get('/:id', getProperty);
router.delete('/:id', deleteProperty);

export default router;
