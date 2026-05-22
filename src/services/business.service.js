import prisma from '../config/db.js';

export const createBusiness = async (data, ownerId) => {
    const slug = data.slug || data.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

    return await prisma.business.create({
        data: {
            ...data,
            slug,
            ownerId
        }
    });
};

export const getBusinessesByOwner = async (ownerId) => {
    return await prisma.business.findMany({
        where: { ownerId },
        include: { services: true, staff: { include: { schedules: true } }, gallery: true }
    });
};

export const getBusinessBySlug = async (slug) => {
    return await prisma.business.findUnique({
        where: { slug },
        include: {
            services: { 
                where: { active: true },
                include: { addons: { where: { active: true } } }
            },
            staff: { include: { schedules: true } },
            gallery: true,
            category: true,
            staff: {
                include: {
                    bookings: {
                        include: {
                            feedback: true
                        }
                    }
                }
            }
        }
    });
};

export const getBusinessById = async (id) => {
    return await prisma.business.findUnique({
        where: { id },
        include: {
            services: { 
                where: { active: true },
                include: { addons: { where: { active: true } } }
            },
            staff: { include: { schedules: true } },
            gallery: true,
            category: true
        }
    });
};

export const createService = async (data) => {
    const { addons, ...serviceData } = data;
    return await prisma.service.create({
        data: {
            ...serviceData,
            ...(addons && addons.length > 0 ? {
                addons: {
                    create: addons
                }
            } : {})
        }
    });
};

export const getServicesByBusiness = async (businessId) => {
    return await prisma.service.findMany({
        where: {
            ...(businessId ? { businessId } : {}),
            active: true
        },
        include: { business: true, addons: { where: { active: true } } }
    });
};

export const getServiceById = async (id) => {
    return await prisma.service.findUnique({
        where: { id },
        include: { business: true, addons: { where: { active: true } } }
    });
};

export const updateService = async (id, data) => {
    const { id: _id, business, addons, createdAt, updatedAt, businessId, ...updateData } = data;
    return await prisma.service.update({
        where: { id },
        data: updateData
    });
};

export const updateServiceForOwner = async (id, ownerId, data) => {
    const service = await prisma.service.findFirst({
        where: {
            id,
            business: { ownerId }
        },
        select: { id: true }
    });

    if (!service) {
        const error = new Error('Servicio no encontrado o no autorizado');
        error.statusCode = 404;
        throw error;
    }

    const { id: _id, business, addons, createdAt, updatedAt, businessId, ...updateData } = data;

    return await prisma.service.update({
        where: { id },
        data: updateData
    });
};

export const deleteService = async (id) => {
    // Soft delete: just set active to false
    return await prisma.service.update({
        where: { id },
        data: { active: false }
    });
};

export const deleteServiceForOwner = async (id, ownerId) => {
    const service = await prisma.service.findFirst({
        where: {
            id,
            business: { ownerId }
        },
        select: { id: true }
    });

    if (!service) {
        const error = new Error('Servicio no encontrado o no autorizado');
        error.statusCode = 404;
        throw error;
    }

    return await prisma.service.update({
        where: { id },
        data: { active: false }
    });
};
export const updateBusiness = async (id, data) => {
    return await prisma.business.update({
        where: { id },
        data
    });
};

export const createBlock = async (businessId, staffId, startTime, endTime, reason) => {
    const staff = await prisma.staff.findFirst({
        where: {
            id: staffId,
            businessId
        },
        select: { id: true }
    });

    if (!staff) {
        throw new Error('Staff does not belong to this business');
    }

    return await prisma.block.create({
        data: {
            staffId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            reason
        }
    });
};

export const getBlocks = async (businessId) => {
    return await prisma.block.findMany({
        where: {
            staff: {
                businessId
            }
        },
        include: {
            staff: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: { startTime: 'asc' }
    });
};

export const deleteBlock = async (id, ownerId) => {
    const block = await prisma.block.findFirst({
        where: {
            id,
            staff: {
                business: {
                    ownerId
                }
            }
        },
        select: { id: true }
    });

    if (!block) {
        throw new Error('Block not found or unauthorized');
    }

    return await prisma.block.delete({
        where: { id }
    });
};

export const createAddon = async (serviceId, ownerId, data) => {
    const service = await prisma.service.findFirst({
        where: { id: serviceId, business: { ownerId } }
    });
    if (!service) throw new Error('Service not found or unauthorized');

    return await prisma.serviceAddon.create({
        data: {
            ...data,
            serviceId
        }
    });
};

export const updateAddon = async (id, ownerId, data) => {
    const addon = await prisma.serviceAddon.findFirst({
        where: { id, service: { business: { ownerId } } }
    });
    if (!addon) throw new Error('Addon not found or unauthorized');

    return await prisma.serviceAddon.update({
        where: { id },
        data
    });
};

export const deleteAddon = async (id, ownerId) => {
    const addon = await prisma.serviceAddon.findFirst({
        where: { id, service: { business: { ownerId } } }
    });
    if (!addon) throw new Error('Addon not found or unauthorized');

    return await prisma.serviceAddon.update({
        where: { id },
        data: { active: false }
    });
};
