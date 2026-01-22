import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const productsPath = path.join(dataDir, 'products.json');

async function getProducts() {
    const data = await fs.readFile(productsPath, 'utf8');
    return JSON.parse(data);
}

async function saveProducts(products: any[]) {
    await fs.writeFile(productsPath, JSON.stringify(products, null, 2));
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const products = await getProducts();

        const index = products.findIndex((p: any) => p.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        products[index] = { ...products[index], ...body };
        // Ensure numeric types
        if (body.price) products[index].price = Number(body.price);
        if (body.stock) products[index].stock = Number(body.stock);

        await saveProducts(products);

        return NextResponse.json(products[index]);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const products = await getProducts();

        const filteredProducts = products.filter((p: any) => p.id !== id);

        if (filteredProducts.length === products.length) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        await saveProducts(filteredProducts);

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
