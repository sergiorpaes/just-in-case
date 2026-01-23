import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

async function getStripeKey() {
    try {
        // Fetch from DB
        let settings = await prisma.settings.findUnique({
            where: { id: 'default' }
        });

        // Initialize object if null, to allow Env override logic to work safely
        if (!settings) settings = {} as any;

        const env = process.env;
        const mode = env.NEXT_PUBLIC_APP_MODE || settings?.mode || 'test';

        let sk = '';
        if (mode === 'test') {
            sk = env.STRIPE_TEST_SK || settings?.test_sk || '';
        } else {
            sk = env.STRIPE_PROD_SK || settings?.prod_sk || '';
        }

        return sk;
    } catch {
        return process.env.STRIPE_SECRET_KEY; // Fallback
    }
}

export async function POST(req: Request) {
    // 1. Get Stripe Key from DB + Env
    const key = await getStripeKey();
    if (!key) return NextResponse.json({ error: 'Stripe Config Missing' }, { status: 500 });

    const stripe = new Stripe(key);

    try {
        const { sessionId } = await req.json();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not paid' }, { status: 400 });
        }

        const itemsMeta = session.metadata?.items;
        if (itemsMeta) {
            const items = JSON.parse(itemsMeta); // { "p1": 2, "p3": 1 }

            // 2. Transaction: Deduct Stock & Save Order
            await prisma.$transaction(async (tx: any) => {
                // Deduct stock for each item
                for (const [id, qty] of Object.entries(items)) {
                    // Decrement stock, but don't let it go below 0 (optional check or use logic)
                    // Prisma doesn't have a simple "decrement but min 0" atomic op without raw SQL or check.
                    // We'll fetch current first to be safe or use simple decrement.
                    // Simple decrement is safer for concurrency if we trust the check.
                    // For now, let's just do an update.
                    const product = await tx.product.findUnique({ where: { id } });
                    if (product) {
                        const newStock = Math.max(0, product.stock - (qty as number));
                        await tx.product.update({
                            where: { id },
                            data: { stock: newStock }
                        });
                    }
                }

                // Create Order
                // Check if exists first to be idempotent
                const existing = await tx.order.findUnique({ where: { id: session.id } });
                if (!existing) {
                    await tx.order.create({
                        data: {
                            id: session.id,
                            total: session.amount_total ? session.amount_total / 100 : 0,
                            status: 'paid',
                            method: 'stripe',
                            items: items, // Saved as Json
                        }
                    });
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
