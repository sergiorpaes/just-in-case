"use client";

import { useEffect, useState } from "react";
import { Package, Smartphone, CreditCard } from "lucide-react";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [productMap, setProductMap] = useState<any>({});
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        fetch("/api/admin/orders")
            .then((res) => res.json())
            .then((data) => {
                if (data.orders) {
                    setOrders(data.orders);
                    setProductMap(data.products || {});
                } else {
                    // Fallback in case API returns array
                    setOrders(Array.isArray(data) ? data : []);
                }
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

    return (
        <div className="max-w-5xl mx-auto relative">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Orders</h1>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Method</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No orders found yet.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors text-sm">
                                    <td className="p-4 font-mono">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-blue-600 hover:text-blue-800 font-medium underline"
                                        >
                                            #{order.id.substring(0, 8)}...
                                        </button>
                                    </td>
                                    <td className="p-4 text-gray-900">{formatDate(order.date)}</td>
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

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Order ID</p>
                                    <p className="font-mono text-sm">{selectedOrder.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Total</p>
                                    <p className="text-2xl font-bold text-primary">€{selectedOrder.total.toFixed(2)}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-3">Items</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items && Object.entries(selectedOrder.items).map(([id, qty]) => {
                                        const product = productMap[id];
                                        return (
                                            <div key={id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden">
                                                        {product?.image ? <img src={product.image} className="w-full h-full object-cover" /> : "IMG"}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{product?.name || "Unknown Product"}</p>
                                                        <p className="text-xs text-gray-500 font-mono">ID: {id}</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-gray-700">x{qty as number}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Date</p>
                                    <p className="font-medium text-sm">{formatDate(selectedOrder.date)}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Payment</p>
                                    <p className="font-medium text-sm capitalize">{selectedOrder.method}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
