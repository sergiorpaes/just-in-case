import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { items, total } = await req.json();

        // Transaction: Check Stock -> Deduct -> Create Order
        await prisma.$transaction(async (tx: any) => {
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.id } });

                if (!product) {
                    throw new Error(`Product ${item.id} not found`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Not enough stock for ${item.name}`);
                }

                await tx.product.update({
                    where: { id: item.id },
                    data: { stock: product.stock - item.quantity }
                });
            }

            // Create Order
            await tx.order.create({
                data: {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    total,
                    status: 'pending_payment',
                    method: 'cash',
                    items: items // Json type
                }
            });
        });

        return NextResponse.json({ success: true, orderId: 'cash-' + Date.now() });

    } catch (err: any) {
        console.error("Cash order error:", err);
        return NextResponse.json({ error: err.message || 'Failed to process cash order' }, { status: 500 });
    }
}
