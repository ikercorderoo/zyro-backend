import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixBanner() {
  try {
    console.log('Updating business banner URL...');
    const updated = await prisma.business.updateMany({
      where: { slug: 'zyro-barber-studio' },
      data: {
        bannerUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop'
      }
    });
    console.log('Update successful. Businesses affected:', updated.count);
  } catch (err) {
    console.error('Update failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixBanner();
