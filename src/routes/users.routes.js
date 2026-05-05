import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 */
router.get('/me', authMiddleware, usersController.getMe);

export default router;
