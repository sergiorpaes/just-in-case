import Store from "@/components/Store";
import ShopHeader from "@/components/ShopHeader";
import { promises as fs } from 'fs';
import path from 'path';

async function getProducts() {
  try {
    // Attempt to read from project root data folder
    const jsonDirectory = path.join(process.cwd(), 'data');
    const fileContents = await fs.readFile(path.join(jsonDirectory, 'products.json'), 'utf8');
    const products = JSON.parse(fileContents);
    // Sort by price ascending (cheaper first)
    return products.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
  } catch (e) {
    console.error("Failed to load products:", e);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  const cwd = process.cwd();
  const dataPath = path.join(cwd, 'data', 'products.json');

  return (
    <div className="space-y-6">
      <ShopHeader />

      {products.length === 0 && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm text-left space-y-2 border border-red-200">
          <p className="font-bold">⚠️ Debug: No products loaded.</p>
          <p className="font-mono text-xs">CWD: {cwd}</p>
          <p className="font-mono text-xs">Target Path: {dataPath}</p>
          <p className="text-xs">
            Check that <code>data/products.json</code> exists and is readable.
          </p>
        </div>
      )}

      <Store products={products} />
    </div>
  );
}
