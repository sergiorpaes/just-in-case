import Store from "@/components/Store";
import ShopHeader from "@/components/ShopHeader";
import ShopFooter from "@/components/ShopFooter";
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    return products.sort((a, b) => Number(a.price) - Number(b.price));
  } catch (e) {
    console.error("Failed to load products:", e);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  const settings = await prisma.settings.findUnique({ where: { id: 'default' } });

  return (
    <div className="space-y-6">
      <ShopHeader />

      {products.length === 0 && (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm text-center">
          <p>No products available at the moment.</p>
        </div>
      )}

      <Store products={products as any} />

      <ShopFooter whatsapp={settings?.whatsapp} />
    </div>
  );
}
