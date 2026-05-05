import request from 'supertest';
import app from '../app.js';
import prisma from '../config/db.js';

describe('Booking Overlap Logic', () => {
    let proToken, clientToken, bizId, serviceId;

    beforeAll(async () => {
        // Setup users
        const pro = await request(app).post('/auth/register').send({
            name: 'Pro User', email: 'pro2@test.com', password: 'password123', role: 'PROFESSIONAL'
        });
        proToken = pro.body.token;

        const client = await request(app).post('/auth/register').send({
            name: 'Client User', email: 'client@test.com', password: 'password123', role: 'CLIENT'
        });
        clientToken = client.body.token;

        // Setup business
        const biz = await request(app)
            .post('/businesses')
            .set('Authorization', `Bearer ${proToken}`)
            .send({
                name: 'Test Biz',
                schedules: [
                    { dayOfWeek: 'Monday', startTime: '09:00', endTime: '18:00' },
                    { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '18:00' },
                    { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '18:00' },
                    { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '18:00' },
                    { dayOfWeek: 'Friday', startTime: '09:00', endTime: '18:00' }
                ]
            });
        bizId = biz.body.id;

        // Setup service
        const svc = await request(app)
            .post('/services')
            .set('Authorization', `Bearer ${proToken}`)
            .send({
                businessId: bizId,
                name: 'Massage',
                duration: 60,
                price: 50.00
            });
        serviceId = svc.body.id;
    });

    afterAll(async () => {
        await prisma.booking.deleteMany();
        await prisma.service.deleteMany();
        await prisma.business.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    it('should create a valid booking', async () => {
        const nextMonday = new Date();
        nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
        nextMonday.setHours(10, 0, 0, 0);

        const res = await request(app)
            .post('/bookings')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                serviceId,
                startTime: nextMonday.toISOString()
            });

        expect(res.statusCode).toEqual(201);
    });

    it('should reject an overlapping booking', async () => {
        const nextMonday = new Date();
        nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
        nextMonday.setHours(10, 30, 0, 0); // Overlaps with 10:00 - 11:00

        const res = await request(app)
            .post('/bookings')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                serviceId,
                startTime: nextMonday.toISOString()
            });

        expect(res.statusCode).toEqual(500); // Error middleware returns 500 for business logic errors if not specified
        expect(res.body.message).toContain('already booked');
    });

    it('should reject booking outside business hours', async () => {
        const nextSunday = new Date();
        nextSunday.setDate(nextSunday.getDate() + (0 + 7 - nextSunday.getDay()) % 7);
        nextSunday.setHours(10, 0, 0, 0);

        const res = await request(app)
            .post('/bookings')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                serviceId,
                startTime: nextSunday.toISOString()
            });

        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toContain('outside business opening hours');
    });
});
