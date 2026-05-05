import * as authService from '../services/auth.service.js';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2),
    lastName: z.string().min(2).optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6),
    role: z.enum(['CLIENT', 'PROFESSIONAL', 'ADMIN']).optional(),
    specialty: z.string().optional(),
    cif: z.string().optional()
}).refine(data => {
    if (data.role === 'PROFESSIONAL' && !data.cif) {
        return false;
    }
    return true;
}, {
    message: "El CIF es obligatorio para profesionales",
    path: ["cif"]
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export const register = async (req, res, next) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const result = await authService.register(validatedData);
        res.status(201).json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const result = await authService.login(email, password);
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        next(error);
    }
};

const changePasswordSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6)
});

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
        await authService.changePassword(req.user.id, currentPassword, newPassword);
        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        next(error);
    }
};
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        const result = await authService.verifyEmail(token);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
