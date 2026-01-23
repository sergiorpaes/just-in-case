const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const productsPath = path.join(__dirname, '..', 'data', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

    console.log(`Seeding ${productsData.length} products...`);

    for (const p of productsData) {
        await prisma.product.upsert({
            where: { id: p.id },
            update: {},
            create: {
                id: p.id,
                name: p.name,
                description: p.description || '',
                price: Number(p.price),
                stock: Number(p.stock),
                image: p.image || ''
            }
        });
    }

    // Seed default settings if needed
    const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
    try {
        const settingsData = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        await prisma.settings.upsert({
            where: { id: 'default' },
            update: {},
            create: {
                id: 'default',
                mode: settingsData.mode || 'test',
                admin_password: settingsData.admin_password || 'admin',
                test_pk: settingsData.test_pk,
                test_sk: settingsData.test_sk,
                prod_pk: settingsData.prod_pk,
                prod_sk: settingsData.prod_sk,
            }
        });
        console.log('Seeded settings.');
    } catch (e) {
        console.log('No settings.json found or invalid, skipping settings seed.');
    }

    console.log('Seeding complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
