import { Router } from 'express';
import * as servicesController from '../controllers/services.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of services
 */
router.get('/', servicesController.getServices);
router.get('/:id', servicesController.getServiceById);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessId, name, duration, price]
 *             properties:
 *               businessId: { type: string }
 *               name: { type: string }
 *               description: { type: string }
 *               duration: { type: integer }
 *               price: { type: number }
 *     responses:
 *       201:
 *         description: Service created
 */
router.post('/', authMiddleware, roleMiddleware(['PROFESSIONAL']), servicesController.createService);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update a service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               duration: { type: integer }
 *               price: { type: number }
 *               active: { type: boolean }
 *     responses:
 *       200:
 *         description: Service updated
 */
router.put('/:id', authMiddleware, roleMiddleware(['PROFESSIONAL']), servicesController.updateService);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted
 *       400:
 *         description: Cannot delete service with active bookings
 */
router.delete('/:id', authMiddleware, roleMiddleware(['PROFESSIONAL']), servicesController.deleteService);

// Addon Routes
router.post('/:serviceId/addons', authMiddleware, roleMiddleware(['PROFESSIONAL']), servicesController.createAddon);
router.put('/addons/:id', authMiddleware, roleMiddleware(['PROFESSIONAL']), servicesController.updateAddon);
router.delete('/addons/:id', authMiddleware, roleMiddleware(['PROFESSIONAL']), servicesController.deleteAddon);

export default router;
