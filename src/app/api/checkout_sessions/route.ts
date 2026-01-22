import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { promises as fs } from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

async function getStripeKey() {
    try {
        const data = await fs.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(data);
        return settings.mode === 'test' ? settings.test_sk : settings.prod_sk;
    } catch {
        return process.env.STRIPE_SECRET_KEY; // Fallback
    }
}

export async function POST(req: Request) {
    const key = await getStripeKey();
    if (!key) return NextResponse.json({ error: 'Stripe Config Missing' }, { status: 500 });

    // Initialize Stripe with dynamic key
    const stripe = new Stripe(key);

    try {
        const body = await req.json();
        const { items } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map((item: any) => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name,
                        // images: [item.image], // Optional: Host must be public
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/`,
            locale: 'en',
            metadata: {
                // We'll store a simplified JSON string of items to process stock later
                // Format: { "p1": 2, "p3": 1 }
                items: JSON.stringify(items.reduce((acc: any, item: any) => {
                    acc[item.id] = item.quantity;
                    return acc;
                }, {}))
            }
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Stripe Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
