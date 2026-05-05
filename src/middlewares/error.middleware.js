import env from '../config/env.js';

export const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);

    let status = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Prisma unique constraint errors globally
    if (err.code === 'P2002') {
        status = 409;
        const target = err.meta?.target || 'campo';
        message = `Ya existe un registro con este ${target}.`;
        if (target.includes('email')) message = 'Este correo electrónico ya está registrado.';
    }

    res.status(status).json({
        status: 'error',
        message,
        ...(env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
