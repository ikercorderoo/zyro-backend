import prisma from '../config/db.js';
import { isOverlapping } from '../utils/time.utils.js';
import { addMinutes, format } from 'date-fns';

const dayAliases = {
    mon: 'monday', monday: 'monday', lunes: 'monday',
    tue: 'tuesday', tuesday: 'tuesday', martes: 'tuesday',
    wed: 'wednesday', wednesday: 'wednesday', miercoles: 'wednesday', miércoles: 'wednesday',
    thu: 'thursday', thursday: 'thursday', jueves: 'thursday',
    fri: 'friday', friday: 'friday', viernes: 'friday',
    sat: 'saturday', saturday: 'saturday', sabado: 'saturday', sábado: 'saturday',
    sun: 'sunday', sunday: 'sunday', domingo: 'sunday'
};

const normalizeDay = (day) => {
    if (!day) return '';
    const key = String(day).trim().toLowerCase();
    return dayAliases[key] || key;
};

export const checkAvailability = async (staffId, serviceIds, startTime, excludeBookingId = null, addonIds = []) => {
    const now = new Date();
    const startRequested = new Date(startTime);

    const staff = await prisma.staff.findUnique({
        where: { id: staffId },
        include: { schedules: true, business: true }
    });

    if (!staff) {
        const error = new Error('Staff no encontrado');
        error.statusCode = 404;
        throw error;
    }

    const business = staff.business;

    // Fetch all services and addons to calculate total duration
    const services = await prisma.service.findMany({
        where: { id: { in: serviceIds } }
    });

    const addons = Array.isArray(addonIds) && addonIds.length > 0
        ? await prisma.serviceAddon.findMany({ where: { id: { in: addonIds } } })
        : [];

    if (services.length !== serviceIds.length) {
        const error = new Error('Uno o más servicios no son válidos');
        error.statusCode = 400;
        throw error;
    }

    const totalDuration = services.reduce((acc, curr) => acc + curr.duration, 0) +
                          addons.reduce((acc, curr) => acc + curr.duration, 0);

    // 1. Check Lead Time
    const minLeadTimeMs = business.minLeadTime * 60000;
    if (startRequested.getTime() < now.getTime() + minLeadTimeMs) {
        const error = new Error(`Citas requieren ${business.minLeadTime} min de antelación`);
        error.statusCode = 400;
        throw error;
    }

    // 2. Check Max Booking Window
    const maxWindowMs = business.maxBookingWindow * 24 * 60 * 60000;
    if (startRequested.getTime() > now.getTime() + maxWindowMs) {
        const error = new Error(`Solo se permite reservar hasta con ${business.maxBookingWindow} días de antelación`);
        error.statusCode = 400;
        throw error;
    }

    const endTime = addMinutes(new Date(startTime), totalDuration);

    // 3. Check working hours of this specific STAFF
    const dayName = normalizeDay(format(new Date(startTime), 'EEEE'));
    const schedule = staff.schedules.find(s => normalizeDay(s.dayOfWeek) === dayName && s.isAvailable);

    if (!schedule) {
        const error = new Error('El profesional no trabaja este día');
        error.statusCode = 400;
        throw error;
    }

    const [openH, openM] = schedule.startTime.split(':').map(Number);
    const [closeH, closeM] = schedule.endTime.split(':').map(Number);

    const openTime = new Date(startTime);
    openTime.setHours(openH, openM, 0, 0);

    const closeTime = new Date(startTime);
    closeTime.setHours(closeH, closeM, 0, 0);

    if (new Date(startTime) < openTime || endTime > closeTime) {
        const error = new Error('La cita está fuera del horario laboral del profesional');
        error.statusCode = 400;
        throw error;
    }

    // 4. Check Manual Blocks (ahora en nivel Staff)
    const overlappingBlock = await prisma.block.findFirst({
        where: {
            staffId,
            OR: [
                {
                    startTime: { lt: endTime },
                    endTime: { gt: new Date(startTime) }
                }
            ]
        }
    });

    if (overlappingBlock) {
        const error = new Error('Este horario está bloqueado manualmente por el profesional');
        error.statusCode = 409;
        throw error;
    }

    // 5. Check overlaps with existing bookings for this STAFF (including Buffer)
    const bufferMs = business.bufferTime * 60000;
    const startWithBuffer = new Date(startRequested.getTime() - bufferMs);
    const endWithBuffer = new Date(endTime.getTime() + bufferMs);

    const existingBookings = await prisma.booking.findMany({
        where: {
            staffId,
            status: 'CONFIRMED',
            id: { not: excludeBookingId || undefined },
            OR: [
                {
                    startTime: { lt: endWithBuffer },
                    endTime: { gt: startWithBuffer }
                }
            ]
        }
    });

    if (existingBookings.length > 0) {
        const error = new Error('El profesional ya tiene otra cita en este horario (o choca con el margen de cortesía)');
        error.statusCode = 409;
        throw error;
    }

    return { startTime: new Date(startTime), endTime, services, addons };
};

export const getAvailableSlotsForStaff = async (staffId, date, totalDuration) => {
    const staff = await prisma.staff.findUnique({
        where: { id: staffId },
        include: { schedules: true, business: true }
    });

    if (!staff) throw new Error('Staff not found');

    const business = staff.business;
    
    // Robust date parsing: "YYYY-MM-DD" -> Local Start of Day
    // important avoid new Date(date) as it parses as UTC
    const localDate = new Date(date + 'T00:00:00');
    const dayName = normalizeDay(format(localDate, 'EEEE'));
    const schedule = staff.schedules.find(s => normalizeDay(s.dayOfWeek) === dayName && s.isAvailable);

    if (!schedule) return [];

    const [openH, openM] = schedule.startTime.split(':').map(Number);
    const [closeH, closeM] = schedule.endTime.split(':').map(Number);

    const currentTime = new Date(localDate);
    currentTime.setHours(openH, openM, 0, 0);

    const endTimeDate = new Date(localDate);
    endTimeDate.setHours(closeH, closeM, 0, 0);

    const interval = business.slotInterval || 30; // Minutaje de slots
    const slots = [];

    const dayStart = new Date(localDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(localDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
        where: {
            staffId,
            status: 'CONFIRMED',
            startTime: { gte: dayStart, lte: dayEnd }
        }
    });

    const blocks = await prisma.block.findMany({
        where: {
            staffId,
            startTime: { lte: dayEnd },
            endTime: { gte: dayStart }
        }
    });

    while (currentTime < endTimeDate) {
        const slotStart = new Date(currentTime);
        const slotEnd = addMinutes(slotStart, totalDuration);

        // Does it fit within the day?
        if (slotEnd <= endTimeDate && slotStart > new Date()) {
            const isBooked = existingBookings.some(b =>
                isOverlapping(slotStart, slotEnd, new Date(b.startTime), new Date(b.endTime))
            );

            const isBlocked = blocks.some(b => 
                isOverlapping(slotStart, slotEnd, new Date(b.startTime), new Date(b.endTime))
            );

            if (!isBooked && !isBlocked) {
                slots.push(format(slotStart, 'HH:mm'));
            }
        }

        currentTime.setMinutes(currentTime.getMinutes() + interval);
    }

    return slots;
};
