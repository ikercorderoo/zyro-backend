import { Router } from 'express';
import * as bookingsController from '../controllers/bookings.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/available-slots', bookingsController.getAvailableSlots);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceId, startTime]
 *             properties:
 *               serviceId: { type: string, format: uuid }
 *               startTime: { type: string, format: date-time }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Invalid input or past date
 *       409:
 *         description: Conflict (overlap)
 */
router.post('/', bookingsController.createBooking);

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/my', bookingsController.getMyBookings);

/**
 * @swagger
 * /bookings/business:
 *   get:
 *     summary: Get all bookings for the business owner
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of business bookings
 */
router.get('/business', roleMiddleware(['PROFESSIONAL']), bookingsController.getBusinessBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
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
 *         description: Booking cancelled
 */
router.delete('/:id', bookingsController.cancelBooking);

/**
 * @swagger
 * /bookings/{id}/reschedule:
 *   patch:
 *     summary: Reschedule a booking
 *     tags: [Bookings]
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
 *             required: [startTime]
 *             properties:
 *               startTime: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Booking rescheduled
 *       400:
 *         description: Invalid input or policy violation
 *       409:
 *         description: Conflict (overlap or block)
 */
router.patch('/:id/reschedule', bookingsController.rescheduleBooking);

export default router;
