import { Router } from 'express';
import { upload, handleUpload } from '../controllers/upload.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Only authenticated users can upload
router.post('/', authMiddleware, upload.single('image'), handleUpload);

export default router;
