import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { generateToken } from '../utils/jwt.utils.js';
import { sendVerificationEmail } from '../utils/email.utils.js';

export const register = async (userData) => {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
    });

    if (existingUser) {
        const error = new Error('Este correo electrónico ya está registrado.');
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    // Generar código de 6 dígitos
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                isVerified: false,
                verificationToken
            }
        });

        // ENVÍO DE EMAIL REAL CON GMAIL
        await sendVerificationEmail(user.email, user.name, verificationToken);

        console.log('📧 Email de verificación enviado a: ' + user.email);

        const { password, ...userWithoutPassword } = user;
        return { 
            message: 'Registro exitoso. Por favor, verifica tu correo electrónico para continuar.',
            user: userWithoutPassword 
        };
    } catch (error) {
        if (error.code === 'P2002') {
            const err = new Error('Este correo electrónico ya está registrado.');
            err.statusCode = 409;
            throw err;
        }
        throw error;
    }
};

export const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
    }

    if (!user.isVerified) {
        const error = new Error('Por favor, verifica tu correo electrónico antes de iniciar sesión.');
        error.statusCode = 403;
        throw error;
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return { user: userWithoutPassword, token };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
        const error = new Error('Contraseña actual incorrecta');
        error.statusCode = 401;
        throw error;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    return await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
    });
};

export const verifyEmail = async (token) => {
    const user = await prisma.user.findFirst({
        where: { verificationToken: token }
    });

    if (!user) {
        const error = new Error('El código de verificación es incorrecto o ha expirado.');
        error.statusCode = 400;
        throw error;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            isVerified: true,
            verificationToken: null
        }
    });

    return { message: 'Código verificado correctamente. Ya puedes iniciar sesión.' };
};
