import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const generateToken = (payload) => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

export const generateResetToken = (payload) => {
    // Expires in 15 minutes
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
};

export const verifyResetToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
        throw new Error('El enlace de recuperación ha caducado o no es válido.');
    }
};
