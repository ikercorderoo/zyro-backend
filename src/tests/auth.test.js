import request from 'supertest';
import app from '../app.js';
import prisma from '../config/db.js';

describe('Auth Endpoints', () => {
    let token;

    beforeAll(async () => {
        await prisma.booking.deleteMany();
        await prisma.service.deleteMany();
        await prisma.business.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                name: 'Test Pro',
                email: 'pro@test.com',
                password: 'password123',
                role: 'PROFESSIONAL'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
    });

    it('should login an existing user', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'pro@test.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    it('should get current user info', async () => {
        const res = await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.email).toEqual('pro@test.com');
    });
});
