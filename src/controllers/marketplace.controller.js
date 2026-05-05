import prisma from '../config/db.js';
import * as businessService from '../services/business.service.js';

export const getBusinessBySlug = async (req, res, next) => {
    try {
        const business = await businessService.getBusinessBySlug(req.params.slug);
        if (!business) return res.status(404).json({ message: 'Negocio no encontrado' });
        const feedbacks = (business.staff || []).flatMap(s => s.bookings || []).map(b => b.feedback).filter(Boolean);
        const reviewsCount = feedbacks.length;
        const rating = reviewsCount > 0 ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / reviewsCount : null;

        const schedules = (business.staff || []).flatMap((member) => member.schedules || []);
        res.json({
            ...business,
            rating,
            reviewsCount,
            schedules
        });
    } catch (error) {
        next(error);
    }
};

export const searchBusinesses = async (req, res, next) => {
    try {
        const { query, category, zone } = req.query;

        const businesses = await prisma.business.findMany({
            where: {
                OR: query ? [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { services: { some: { name: { contains: query, mode: 'insensitive' } } } }
                ] : undefined,
                categoryId: category || undefined,
                address: zone ? { contains: zone, mode: 'insensitive' } : undefined,
            },
            include: {
                category: true,
                services: { where: { active: true }, take: 3 }
            }
        });

        res.json(businesses);
    } catch (error) {
        next(error);
    }
};

export const getRecommendations = async (req, res, next) => {
    try {
        const { zone } = req.query;
        
        const businesses = await prisma.business.findMany({
            where: {
                address: zone ? { contains: zone, mode: 'insensitive' } : undefined,
                services: { some: { active: true } } 
            },
            take: 4,
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                services: { where: { active: true }, take: 1 },
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
        
        const formattedBusinesses = businesses.map(business => {
            const feedbacks = (business.staff || []).flatMap(s => s.bookings || []).map(b => b.feedback).filter(Boolean);
            const reviewsCount = feedbacks.length;
            const rating = reviewsCount > 0 ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / reviewsCount : null;
            
            return {
                ...business,
                rating,
                reviewsCount
            };
        });
        
        res.json(formattedBusinesses);
    } catch (error) {
        next(error);
    }
};
