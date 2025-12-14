
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { pin: '1234' },
    });
    console.log('Found user:', user);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
