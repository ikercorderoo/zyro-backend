import * as bookingService from '../services/booking.service.js';
import { z } from 'zod';
import prisma from '../config/db.js';

const bookingSchema = z.object({
    staffId: z.string().uuid(),
    serviceIds: z.array(z.string().uuid()).min(1),
    addonIds: z.array(z.string().uuid()).optional(),
    startTime: z.string().datetime(), // Valid ISO 8601
    notes: z.string().optional()
});

const legacyBookingSchema = z.object({
    serviceId: z.string().uuid(),
    startTime: z.string().datetime(),
    notes: z.string().optional()
});

export const createBooking = async (req, res, next) => {
    try {
        let staffId;
        let serviceIds;
        let startTime;
        let notes;
        let addonIds = [];

        const parsedNew = bookingSchema.safeParse(req.body);
        if (parsedNew.success) {
            ({ staffId, serviceIds, startTime, notes, addonIds = [] } = parsedNew.data);
        } else {
            const parsedLegacy = legacyBookingSchema.parse(req.body);
            const service = await prisma.service.findUnique({
                where: { id: parsedLegacy.serviceId },
                include: { business: { include: { staff: true } } }
            });

            if (!service || !service.active) {
                return res.status(404).json({ message: 'Servicio no encontrado' });
            }

            const fallbackStaff = service.business?.staff?.[0];
            if (!fallbackStaff) {
                return res.status(400).json({ message: 'No hay profesionales disponibles para este servicio' });
            }

            staffId = fallbackStaff.id;
            serviceIds = [parsedLegacy.serviceId];
            startTime = parsedLegacy.startTime;
            notes = parsedLegacy.notes;
        }

        const booking = await bookingService.createBooking(req.user.id, staffId, serviceIds, startTime, notes, addonIds);
        res.status(201).json(booking);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        next(error);
    }
};

export const getMyBookings = async (req, res, next) => {
    try {
        const bookings = await bookingService.getUserBookings(req.user.id);
        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

export const getBusinessBookings = async (req, res, next) => {
    try {
        const bookings = await bookingService.getBusinessBookings(req.user.id);
        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

export const cancelBooking = async (req, res, next) => {
    try {
        const { reason } = req.body || {};
        const booking = await bookingService.cancelBooking(req.params.id, req.user.id, req.user.role, reason);
        res.json(booking);
    } catch (error) {
        next(error);
    }
};

const rescheduleSchema = z.object({
    startTime: z.string().datetime()
});

export const rescheduleBooking = async (req, res, next) => {
    try {
        const { startTime } = rescheduleSchema.parse(req.body);
        const booking = await bookingService.rescheduleBooking(req.params.id, req.user.id, req.user.role, startTime);
        res.json(booking);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        next(error);
    }
};

export const getAvailableSlots = async (req, res, next) => {
    try {
        const schema = z.object({
            serviceId: z.string().uuid(),
            date: z.string().min(10),
            addonIds: z.string().optional() // Comma separated string
        });

        const { serviceId, date, addonIds } = schema.parse(req.query);
        const addonArray = addonIds ? addonIds.split(',').filter(Boolean) : [];
        
        const { slots, staffId } = await bookingService.getAvailableSlotsByService(serviceId, date, addonArray);
        res.json({ slots, staffId });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        next(error);
    }
};
