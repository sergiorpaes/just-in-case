"use client";

import { useEffect, useState } from "react";
import { Package, Smartphone, CreditCard } from "lucide-react";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/orders")
            .then((res) => res.json())
            .then((data) => {
                setOrders(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch orders", err);
                setLoading(false);
            });
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatItems = (items: any) => {
        // items is { "p1": 2, "p2": 1 }
        // We might want to fetch product names, but for now let's just show ID and qty
        // Or if we can, the API should populate the names.
        // For simpler v1, let's just show the raw JSON or a simple list.
        // Actually, the current JSON structure is simple.
        if (!items) return "No items";
        return Object.entries(items).map(([id, qty]) => `${qty}x ${id}`).join(", ");
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Orders</h1>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Items</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Method</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No orders found yet.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors text-sm">
                                    <td className="p-4 font-mono text-gray-500" title={order.id}>
                                        {order.id.substring(0, 8)}...
                                    </td>
                                    <td className="p-4 text-gray-900">{formatDate(order.date)}</td>
                                    <td className="p-4 text-gray-600 max-w-xs truncate" title={JSON.stringify(order.items)}>
                                        {/* Ideally we would map product IDs to names here */}
                                        <span className="font-mono text-xs">{JSON.stringify(order.items)}</span>
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">€{order.total.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium capitalize ${order.method === 'stripe' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {order.method === 'stripe' ? <CreditCard size={12} /> : <Smartphone size={12} />}
                                            {order.method}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold capitalize ${order.status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
