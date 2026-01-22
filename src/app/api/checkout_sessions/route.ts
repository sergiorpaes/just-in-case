import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        // apiVersion: '...', 
    })
    : null;

export async function POST(req: Request) {
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
    }
    try {
        const { items } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: 'usd', // Or eur, depending on location. Defaulting to USD for now.
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [], // TODO: Ensure these are absolute URLs in prod
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/`,
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
