import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { items, total } = await req.json();
        const dataDir = path.join(process.cwd(), 'data');
        const productsPath = path.join(dataDir, 'products.json');
        const ordersPath = path.join(dataDir, 'orders.json');

        // Read current data
        const productsData = JSON.parse(await fs.readFile(productsPath, 'utf8'));
        const ordersData = JSON.parse(await fs.readFile(ordersPath, 'utf8'));

        // Update stock
        for (const item of items) {
            const productIndex = productsData.findIndex((p: any) => p.id === item.id);
            if (productIndex > -1) {
                if (productsData[productIndex].stock < item.quantity) {
                    return NextResponse.json({ error: `Not enough stock for ${item.name}` }, { status: 400 });
                }
                productsData[productIndex].stock -= item.quantity;
            }
        }

        // Record order
        const newOrder = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            items,
            total,
            method: 'cash',
            status: 'pending_payment' // Cash put in box?
        };
        ordersData.push(newOrder);

        // Write back
        await fs.writeFile(productsPath, JSON.stringify(productsData, null, 2));
        await fs.writeFile(ordersPath, JSON.stringify(ordersData, null, 2));

        return NextResponse.json({ success: true, orderId: newOrder.id });

    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to process cash order' }, { status: 500 });
    }
}
