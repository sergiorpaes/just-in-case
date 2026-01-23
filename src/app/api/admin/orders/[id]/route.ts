import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        // Await params in Next.js 15
        const { id } = await params;

        const order = await prisma.order.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
