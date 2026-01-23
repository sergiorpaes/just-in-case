import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        // Use params.id directly. 
        // Note: In Next.js 15 params might need awaiting, but sticking to standard pattern for now.
        // If this is Next.js < 15, params is object.
        const id = params.id;

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
