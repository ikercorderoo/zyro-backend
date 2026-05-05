import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Attempting to connect to database...');
    const count = await prisma.business.count();
    console.log('Connection successful. Business count:', count);
  } catch (err) {
    console.error('Database connection failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
