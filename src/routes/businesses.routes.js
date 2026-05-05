import { Router } from 'express';
import * as businessesController from '../controllers/businesses.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * /businesses:
 *   post:
 *     summary: Create a new business
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, schedules]
 *             properties:
 *               name: { type: string }
 *               schedules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dayOfWeek: { type: string }
 *                     startTime: { type: string }
 *                     endTime: { type: string }
 *                     isAvailable: { type: boolean }
 *     responses:
 *       201:
 *         description: Business created
 */
router.get('/my', authMiddleware, roleMiddleware(['PROFESSIONAL']), businessesController.getMyBusinesses);
router.post('/', authMiddleware, roleMiddleware(['PROFESSIONAL']), businessesController.createBusiness);

/**
 * @swagger
 * /businesses/{id}:
 *   get:
 *     summary: Get business by ID
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business details
 *       404:
 *         description: Business not found
 */
router.get('/:id', businessesController.getBusiness);

/**
 * @swagger
 * /businesses/{id}:
 *   put:
 *     summary: Update business policies
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               minLeadTime: { type: integer }
 *               maxBookingWindow: { type: integer }
 *               cancellationWindow: { type: integer }
 *               bufferTime: { type: integer }
 *     responses:
 *       200:
 *         description: Business updated
 */
router.put('/:id', authMiddleware, roleMiddleware(['PROFESSIONAL']), businessesController.updateBusiness);

/**
 * @swagger
 * /businesses/{id}/blocks:
 *   post:
 *     summary: Create an agenda block
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startTime, endTime]
 *             properties:
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *               reason: { type: string }
 *     responses:
 *       201:
 *         description: Block created
 */
router.post('/:id/blocks', authMiddleware, roleMiddleware(['PROFESSIONAL']), businessesController.createBlock);

/**
 * @swagger
 * /businesses/{id}/blocks:
 *   get:
 *     summary: Get all blocks for a business
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: List of blocks
 */
router.get('/:id/blocks', businessesController.getBlocks);

/**
 * @swagger
 * /businesses/blocks/{id}:
 *   delete:
 *     summary: Delete an agenda block
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: Block deleted
 */
router.delete('/blocks/:id', authMiddleware, roleMiddleware(['PROFESSIONAL']), businessesController.deleteBlock);

export default router;
