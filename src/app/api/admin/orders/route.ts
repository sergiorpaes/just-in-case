export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Also fetch products so we can show names instead of just IDs
        const products = await prisma.product.findMany();
        const productMap = products.reduce((acc: any, p) => {
            acc[p.id] = p;
            return acc;
        }, {});

        return NextResponse.json({ orders, products: productMap });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
    }
}
