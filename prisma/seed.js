import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Seed Categories
    const categories = [
        { name: 'Barbería', slug: 'barberia', icon: 'Scissors' },
        { name: 'Peluquería', slug: 'peluqueria', icon: 'UserRound' },
        { name: 'Uñas', slug: 'unas', icon: 'Hand' },
        { name: 'Estética', slug: 'estetica', icon: 'Sparkles' },
        { name: 'Fisioterapia', slug: 'fisioterapia', icon: 'Activity' },
        { name: 'Tatuajes', slug: 'tatuajes', icon: 'PenTool' },
        { name: 'Gimnasio', slug: 'gimnasio', icon: 'Dumbbell' },
        { name: 'Otros', slug: 'otros', icon: 'MoreHorizontal' },
    ];

    console.log('   Creating categories...');
    for (const category of categories) {
        await prisma.businessCategory.upsert({
            where: { slug: category.slug },
            update: { icon: category.icon },
            create: category,
        });
    }

    // 2. Create a Professional User
    console.log('   Creating sample professional user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const professional = await prisma.user.upsert({
        where: { email: 'pro@zyro.com' },
        update: {},
        create: {
            email: 'pro@zyro.com',
            name: 'Iker',
            lastName: 'Professional',
            password: hashedPassword,
            role: 'PROFESSIONAL',
            phone: '600111222'
        }
    });

    // 3. Create a Business
    console.log('   Creating sample business...');
    const barberCategory = await prisma.businessCategory.findUnique({ where: { slug: 'barberia' } });
    
    const business = await prisma.business.upsert({
        where: { slug: 'zyro-barber-studio' },
        update: {},
        create: {
            name: 'Zyro Barber Studio',
            slug: 'zyro-barber-studio',
            description: 'La mejor experiencia de corte en la ciudad.',
            address: 'Calle Falsa 123, Madrid',
            ownerId: professional.id,
            categoryId: barberCategory?.id,
            imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop',
            bannerUrl: 'https://images.unsplash.com/photo-1512690196252-75176796dcc3?q=80&w=2070&auto=format&fit=crop'
        }
    });

    // 4. Create Staff
    console.log('   Creating sample staff...');
    const staff = await prisma.staff.create({
        data: {
            name: 'Carlos Estilista',
            role: 'Barbero Senior',
            businessId: business.id,
            imageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop'
        }
    });

    // 5. Create Services
    console.log('   Creating sample services...');
    await prisma.service.createMany({
        data: [
            { name: 'Corte de Pelo', duration: 30, price: 15.00, businessId: business.id },
            { name: 'Afeitado Clásico', duration: 20, price: 10.00, businessId: business.id },
            { name: 'Corte + Barba', duration: 45, price: 22.00, businessId: business.id }
        ]
    });

    console.log('✅ Seed finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
