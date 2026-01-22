"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { use } from "react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Use React.use() to unwrap the params promise
    const { id } = use(params);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: ""
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Ensure we query for the specific ID, though API returns list by default, 
                // we'll filter or if we had a specific GET /api/products/[id] we'd use that.
                // Re-using the list endpoint for simplicity or assume we build the single GET.
                // Actually, the PUT route exists, but let's see if we can GET specific.
                // We'll just fetch all and filter for now to save a route creation, or create specific GET.
                // Let's create specific GET in the route first? No, let's just fetch all for now, it's small data.
                const res = await fetch("/api/admin/products");
                const products = await res.json();
                const product = products.find((p: any) => p.id === id);

                if (product) {
                    setFormData({
                        name: product.name,
                        description: product.description,
                        price: product.price.toString(),
                        stock: product.stock.toString(),
                        image: product.image
                    });
                } else {
                    alert("Product not found");
                    router.push("/507f191e-810c-41ce-96b9-a9a7a9e33b0d");
                }
            } catch (error) {
                console.error("Failed to load product", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/507f191e-810c-41ce-96b9-a9a7a9e33b0d");
                router.refresh();
            } else {
                alert("Failed to update product");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating product");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/507f191e-810c-41ce-96b9-a9a7a9e33b0d" className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm mb-2">
                    <ArrowLeft size={16} /> Back to Products
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Price (€)</label>
                        <input
                            required
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                        <input
                            required
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Image</label>
                    <div className="flex flex-col gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const data = new FormData();
                                data.append("file", file);

                                try {
                                    const res = await fetch("/api/admin/upload", {
                                        method: "POST",
                                        body: data,
                                    });
                                    if (res.ok) {
                                        const { url } = await res.json();
                                        setFormData((prev) => ({ ...prev, image: url }));
                                    } else {
                                        alert("Upload failed");
                                    }
                                } catch (err) {
                                    alert("Error uploading image");
                                }
                            }}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <input
                            type="text"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            placeholder="Or paste URL..."
                        />
                    </div>
                    {formData.image && <p className="text-xs text-green-600 mt-1">Current: {formData.image}</p>}
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={18} /> {saving ? 'Saving...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
