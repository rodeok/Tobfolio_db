import { Router } from 'express';
import multer from 'multer';
import { uploadFile } from '@/controllers/uploadController.js';
import { authMiddleware } from '@/middleware/authMiddleware.js';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', authMiddleware, upload.single('file'), uploadFile);

export default router;
