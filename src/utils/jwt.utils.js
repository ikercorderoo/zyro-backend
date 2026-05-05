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
