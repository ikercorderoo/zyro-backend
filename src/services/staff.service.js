import prisma from '../config/db.js';

export const createStaff = async (businessId, staffData) => {
    return await prisma.staff.create({
        data: {
            ...staffData,
            businessId
        }
    });
};

export const getStaffByBusiness = async (businessId) => {
    return await prisma.staff.findMany({
        where: { businessId },
        include: {
            schedules: true,
            blocks: true
        }
    });
};

export const updateStaff = async (id, staffData) => {
    return await prisma.staff.update({
        where: { id },
        data: staffData
    });
};

export const deleteStaff = async (id) => {
    return await prisma.staff.delete({
        where: { id }
    });
};

// Horarios del Staff
export const updateStaffSchedule = async (staffId, schedules) => {
    return await prisma.$transaction(async (tx) => {
        // Eliminar horarios anteriores
        await tx.schedule.deleteMany({
            where: { staffId }
        });
        
        // Crear los nuevos
        if (schedules && schedules.length > 0) {
            const newSchedules = schedules.map(s => ({
                ...s,
                staffId
            }));
            await tx.schedule.createMany({
                data: newSchedules
            });
        }
        
        return await tx.staff.findUnique({
            where: { id: staffId },
            include: { schedules: true }
        });
    });
};

// Bloqueos del Staff
export const createBlock = async (staffId, startTime, endTime, reason) => {
    return await prisma.block.create({
        data: {
            staffId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            reason
        }
    });
};

export const deleteBlock = async (id) => {
    return await prisma.block.delete({
        where: { id }
    });
};
