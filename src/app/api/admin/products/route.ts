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

export async function GET() {
    try {
        const products = await getProducts();
        return NextResponse.json(products);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const products = await getProducts();

        const newProduct = {
            id: 'p' + Date.now().toString(),
            ...body,
            stock: Number(body.stock) || 0,
            price: Number(body.price) || 0,
        };

        products.push(newProduct);
        await saveProducts(products);

        return NextResponse.json(newProduct);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
