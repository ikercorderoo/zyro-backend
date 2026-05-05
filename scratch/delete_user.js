import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    await prisma.user.deleteMany({ where: { email: 'aitoreitor3000@gmail.com' } });
    console.log('Usuario borrado con éxito');
}
main().catch(console.error).finally(() => prisma.$disconnect());
