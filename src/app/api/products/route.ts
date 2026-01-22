import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        const jsonDirectory = path.join(process.cwd(), 'data');
        const fileContents = await fs.readFile(path.join(jsonDirectory, 'products.json'), 'utf8');
        const products = JSON.parse(fileContents);
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
    }
}
