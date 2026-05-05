import dotenv from 'dotenv';
dotenv.config();

export default {
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 4000,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    NODE_ENV: process.env.NODE_ENV || 'development'
};

console.log(`Database host: ${process.env.DATABASE_URL?.split('@')[1] || 'None'}`);
console.log(`Email user: ${process.env.EMAIL_USER}`);
