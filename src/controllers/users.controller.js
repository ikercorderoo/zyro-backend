import prisma from '../config/db.js';

export const getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.json(user);
    } catch (error) {
        next(error);
    }
};
