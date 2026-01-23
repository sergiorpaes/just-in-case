import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(products);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const newProduct = await prisma.product.create({
            data: {
                name: body.name,
                description: body.description,
                price: Number(body.price) || 0,
                stock: Number(body.stock) || 0,
                image: body.image || '',
            }
        });

        return NextResponse.json(newProduct);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
