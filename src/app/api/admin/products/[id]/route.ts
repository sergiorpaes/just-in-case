import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                price: body.price ? Number(body.price) : undefined,
                stock: body.stock ? Number(body.stock) : undefined,
                image: body.image,
            }
        });

        return NextResponse.json(updatedProduct);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
