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
                nameI18n: body.nameI18n || {},
                descriptionI18n: body.descriptionI18n || {},
                isActive: body.isActive !== undefined ? body.isActive : true
            }
        });

        return NextResponse.json(newProduct);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();

        const updatedProduct = await prisma.product.update({
            where: { id: body.id },
            data: {
                name: body.name,
                description: body.description,
                price: Number(body.price) || 0,
                stock: Number(body.stock) || 0,
                image: body.image || '',
                nameI18n: body.nameI18n || {},
                descriptionI18n: body.descriptionI18n || {},
                isActive: body.isActive !== undefined ? body.isActive : true
            }
        });

        return NextResponse.json(updatedProduct);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();

        const updatedProduct = await prisma.product.update({
            where: { id: body.id },
            data: {
                isActive: body.isActive
            }
        });

        return NextResponse.json(updatedProduct);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to update product status' }, { status: 500 });
    }
}
