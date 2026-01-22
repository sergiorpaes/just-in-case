import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { promises as fs } from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
const dataDir = path.join(process.cwd(), 'data');
const productsPath = path.join(dataDir, 'products.json');
const ordersPath = path.join(dataDir, 'orders.json');

async function getProducts() {
    const data = await fs.readFile(productsPath, 'utf8');
    return JSON.parse(data);
}

async function saveProducts(products: any[]) {
    await fs.writeFile(productsPath, JSON.stringify(products, null, 2));
}

async function saveOrder(order: any) {
    const data = await fs.readFile(ordersPath, 'utf8');
    const orders = JSON.parse(data);
    // Check dupe
    if (orders.find((o: any) => o.id === order.id)) return;
    orders.push(order);
    await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));
}

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
            const products = await getProducts();

            // Deduct stock
            for (const [id, qty] of Object.entries(items)) {
                const p = products.find((p: any) => p.id === id);
                if (p) {
                    p.stock = Math.max(0, p.stock - (qty as number));
                }
            }
            await saveProducts(products);

            // Save Order
            await saveOrder({
                id: session.id,
                date: new Date().toISOString(),
                items: items,
                total: session.amount_total ? session.amount_total / 100 : 0,
                method: 'stripe',
                status: 'paid'
            });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
