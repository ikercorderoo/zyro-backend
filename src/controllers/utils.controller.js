import prisma from '../config/db.js';

export const createFeedback = async (req, res, next) => {
    try {
        const { bookingId, rating, comment } = req.body;
        const userId = req.user.id;

        // Validation
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { feedback: true }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        if (booking.userId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para calificar esta reserva' });
        }

        if (booking.status === 'CANCELLED') {
            return res.status(400).json({ message: 'No se puede calificar una reserva cancelada' });
        }

        if (new Date() < new Date(booking.startTime)) {
            return res.status(400).json({ message: 'Aún no ha pasado la hora de la reserva' });
        }

        if (booking.feedback) {
            return res.status(400).json({ message: 'Esta reserva ya tiene una reseña' });
        }

        const feedback = await prisma.feedback.create({
            data: { 
                bookingId, 
                rating: parseInt(rating), 
                comment 
            }
        });

        res.status(201).json(feedback);
    } catch (error) {
        next(error);
    }
};

export const getAllFeedbacks = async (req, res, next) => {
    try {
        const feedbacks = await prisma.feedback.findMany({
            include: { booking: { include: { user: true, service: true } } }
        });
        res.json(feedbacks);
    } catch (error) {
        next(error);
    }
};

export const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { sentAt: 'desc' }
        });
        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

export const getCategories = async (req, res, next) => {
    try {
        const categories = await prisma.businessCategory.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

export const updateSystemConfig = async (req, res, next) => {
    try {
        // Skeleton for "Configurar sistema" from diagram
        res.json({ message: "System configuration updated (Role: Admin only)" });
    } catch (error) {
        next(error);
    }
};

import { sendContactFormEmail } from '../utils/email.utils.js';

export const submitContactForm = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        await sendContactFormEmail(name, email, subject, message);

        res.status(200).json({ message: 'Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.' });
    } catch (error) {
        next(error);
    }
};
