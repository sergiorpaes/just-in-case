const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const products = await prisma.product.findMany();
    console.log("Total Products:", products.length);
    products.forEach(p => {
        console.log(`\nProduct: ${p.name}`);
        console.log("nameI18n:", p.nameI18n);
        console.log("descriptionI18n:", p.descriptionI18n);
    });
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
