import { Router } from 'express';
import * as utilsController from '../controllers/utils.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * /utils/feedback:
 *   post:
 *     summary: Create feedback for a booking
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId, rating]
 *             properties:
 *               bookingId: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Feedback created
 */
router.post('/feedback', authMiddleware, utilsController.createFeedback);

/**
 * @swagger
 * /utils/feedback:
 *   get:
 *     summary: Get all feedbacks (Admin only)
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all feedbacks
 */
router.get('/feedback', authMiddleware, roleMiddleware(['ADMIN']), utilsController.getAllFeedbacks);

/**
 * @swagger
 * /utils/notifications:
 *   get:
 *     summary: Get current user's notifications
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/notifications', authMiddleware, utilsController.getMyNotifications);

/**
 * @swagger
 * /utils/admin/config:
 *   post:
 *     summary: Update system config (Admin only)
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Config updated
 */
router.post('/admin/config', authMiddleware, roleMiddleware(['ADMIN']), utilsController.updateSystemConfig);

/**
 * @swagger
 * /utils/categories:
 *   get:
 *     summary: Get all business categories
 *     tags: [Utils]
 *     responses:
 *       200:
 *         description: List of all categories
 */
router.get('/categories', utilsController.getCategories);
router.post('/contact', utilsController.submitContactForm);

export default router;
