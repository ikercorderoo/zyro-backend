import prisma from '../config/db.js';
import * as availabilityService from './availability.service.js';

export const createBooking = async (userId, staffId, serviceIds, startTime, notes = null, addonIds = []) => {
    // serviceIds and addonIds are arrays
    const { startTime: start, endTime, services, addons } = await availabilityService.checkAvailability(
        staffId,
        serviceIds,
        startTime,
        null,
        addonIds
    );

    return await prisma.$transaction(async (tx) => {
        // Create booking
        const booking = await tx.booking.create({
            data: {
                userId,
                staffId,
                startTime: start,
                endTime,
                notes,
                status: 'CONFIRMED'
            }
        });

        // Add BookingServices capturing duration and price
        const bookingServicesData = services.map(srv => ({
            bookingId: booking.id,
            serviceId: srv.id,
            price: srv.price,
            duration: srv.duration
        }));

        await tx.bookingService.createMany({
            data: bookingServicesData
        });

        // Add BookingAddons capturing duration and price
        if (addons && addons.length > 0) {
            const bookingAddonsData = addons.map(add => ({
                bookingId: booking.id,
                serviceAddonId: add.id,
                price: add.price,
                duration: add.duration
            }));
            await tx.bookingAddon.createMany({
                data: bookingAddonsData
            });
        }

        // Fetch complete booking
        return await tx.booking.findUnique({
            where: { id: booking.id },
            include: { 
                services: { include: { service: true } }, 
                addons: { include: { serviceAddon: true } },
                staff: true 
            }
        });
    });
};

export const getUserBookings = async (userId) => {
    return await prisma.booking.findMany({
        where: { userId },
        include: { 
            services: { include: { service: { include: { business: true } } } },
            addons: { include: { serviceAddon: true } },
            staff: true,
            feedback: true
        },
        orderBy: { startTime: 'desc' }
    });
};

export const getBusinessBookings = async (ownerId) => {
    return await prisma.booking.findMany({
        where: { staff: { business: { ownerId } } },
        include: { 
            services: { include: { service: true } }, 
            user: { select: { name: true, email: true } },
            staff: true
        }
    });
};

export const rescheduleBooking = async (id, userId, role, newStartTime) => {
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { services: true, staff: { include: { business: true } } }
    });

    if (!booking) {
        const error = new Error('Booking not found');
        error.statusCode = 404;
        throw error;
    }

    // Authorization: Only client or business owner
    if (role !== 'PROFESSIONAL' && booking.userId !== userId) {
        const error = new Error('Forbidden');
        error.statusCode = 403;
        throw error;
    }

    const serviceIds = booking.services.map(s => s.serviceId);

    const { startTime: start, endTime } = await availabilityService.checkAvailability(
        booking.staffId,
        serviceIds,
        newStartTime,
        id // Exclude current booking from overlap check
    );

    return await prisma.booking.update({
        where: { id },
        data: {
            startTime: start,
            endTime,
            status: 'CONFIRMED' // Ensure it's confirmed if it was pending
        }
    });
};

export const cancelBooking = async (id, userId, role, reason = null) => {
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { staff: { include: { business: true } } }
    });

    if (!booking) {
        const error = new Error('Booking not found');
        error.statusCode = 404;
        throw error;
    }

    if (role !== 'PROFESSIONAL' && booking.userId !== userId) {
        const error = new Error('Forbidden');
        error.statusCode = 403;
        throw error;
    }

    const business = booking.staff.business;
    const now = new Date();
    const limitDate = new Date(booking.startTime.getTime() - (business.cancellationWindow * 3600000));

    if (now > limitDate && role !== 'PROFESSIONAL') {
        const error = new Error(`No se puede cancelar con menos de ${business.cancellationWindow}h de antelación`);
        error.statusCode = 400;
        throw error;
    }

    return await prisma.booking.update({
        where: { id },
        data: { 
            status: 'CANCELLED',
            cancellationReason: reason
        }
    });
};

export const getAvailableSlotsByService = async (serviceId, date, addonIds = []) => {
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: {
            business: {
                include: {
                    staff: {
                        include: { schedules: true }
                    }
                }
            },
            addons: true
        }
    });

    if (!service || !service.active) {
        const error = new Error('Servicio no encontrado');
        error.statusCode = 404;
        throw error;
    }

    // Calculate total duration including selected addons
    const selectedAddons = Array.isArray(addonIds) && addonIds.length > 0
        ? service.addons.filter(a => addonIds.includes(a.id))
        : [];
    
    const totalDuration = service.duration + selectedAddons.reduce((acc, curr) => acc + curr.duration, 0);

    const staffList = service.business?.staff || [];
    if (staffList.length === 0) {
        return { slots: [], staffId: null };
    }

    // Aggregated slots from all available staff
    for (const staff of staffList) {
        const slots = await availabilityService.getAvailableSlotsForStaff(staff.id, date, totalDuration);
        if (slots.length > 0) {
            return { slots, staffId: staff.id };
        }
    }

    return { slots: [], staffId: staffList[0]?.id || null };
};
