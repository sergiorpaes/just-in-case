import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');

    if (!guestId) return NextResponse.json({ error: 'Guest ID missing' }, { status: 400 });

    try {
        const tab = await prisma.tab.findUnique({
            where: { guestId },
        });

        return NextResponse.json(tab || { items: [], total: 0 });
    } catch (error) {
        console.error('Tab Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch tab' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { guestId, items } = body;

        if (!guestId) return NextResponse.json({ error: 'Guest ID missing' }, { status: 400 });
        if (!items) return NextResponse.json({ error: 'Items missing' }, { status: 400 });

        // Calculate total
        const total = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

        const tab = await prisma.tab.upsert({
            where: { guestId },
            update: {
                items,
                total,
            },
            create: {
                guestId,
                items,
                total,
            },
        });

        return NextResponse.json(tab);
    } catch (error) {
        console.error('Tab Update Error:', error);
        return NextResponse.json({ error: 'Failed to update tab' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');

    if (!guestId) return NextResponse.json({ error: 'Guest ID missing' }, { status: 400 });

    try {
        await prisma.tab.delete({
            where: { guestId },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        // If not found, it's already "cleared"
        return NextResponse.json({ success: true });
    }
}
