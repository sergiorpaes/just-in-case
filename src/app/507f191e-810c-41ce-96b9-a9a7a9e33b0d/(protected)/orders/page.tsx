"use client";

import { useEffect, useState, useMemo } from "react";
import { Package, Smartphone, CreditCard, ArrowUpDown, Download, Calendar } from "lucide-react";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [productMap, setProductMap] = useState<any>({});
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // Filters & Sorting
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        fetch("/api/admin/orders")
            .then((res) => res.json())
            .then((data) => {
                if (data.orders) {
                    setOrders(data.orders);
                    setProductMap(data.products || {});
                } else {
                    setOrders(Array.isArray(data) ? data : []);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch orders", err);
                setLoading(false);
            });
    };

    const updateStatus = async (id: string, newStatus: string) => {
        // Optimistic update
        const originalOrders = [...orders];
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));

        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error("Failed");
        } catch (err) {
            alert("Failed to update status");
            setOrders(originalOrders);
        }
    };

    // --- Derived Data ---

    const filteredOrders = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return orders.filter(order => {
            const orderDate = new Date(order.date);

            if (dateFilter === 'today') {
                return orderDate >= startOfDay;
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return orderDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return orderDate >= monthAgo;
            }
            return true;
        });
    }, [orders, dateFilter]);

    const sortedOrders = useMemo(() => {
        return [...filteredOrders].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredOrders, sortConfig]);

    const stats = useMemo(() => {
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        return {
            count: filteredOrders.length,
            revenue: totalRevenue
        };
    }, [filteredOrders]);

    // --- Actions ---

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const exportCSV = () => {
        const headers = ["Order ID,Date,Method,Status,Total,Items"];
        const rows = sortedOrders.map(o => {
            // Format items into a readable string "2x Wine; 1x Chips"
            let itemsStr = "";
            if (o.items) {
                const itemsList = Array.isArray(o.items)
                    ? o.items
                    : Object.entries(o.items).map(([id, qty]) => ({ id, quantity: qty }));

                itemsStr = itemsList.map((item: any) => {
                    const id = item.id;
                    const qty = item.quantity;
                    const product = productMap[id] || (item.name ? item : null);
                    const name = product ? product.name : id; // Use Name if found, else ID
                    return `${qty}x ${name}`;
                }).join("; ");
            } else {
                itemsStr = "No Details";
            }

            return [
                o.id,
                new Date(o.date).toLocaleDateString(),
                o.method,
                o.status,
                o.total.toFixed(2),
                `"${itemsStr}"` // Quote to handle commas
            ].join(",");
        });

        const csvContent = headers.concat(rows).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

    return (
        <div className="max-w-6xl mx-auto relative pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Orders</h1>

                <div className="flex items-center gap-2">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Las 7 Days</option>
                        <option value="month">Last 30 Days</option>
                    </select>

                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.count}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Revenue</p>
                    <p className="text-2xl font-bold text-emerald-600">€{stats.revenue.toFixed(2)}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold cursor-pointer">
                            <th className="p-4 hover:bg-gray-100 transition" onClick={() => handleSort('id')}>Order ID <ArrowUpDown size={12} className="inline ml-1 opacity-50" /></th>
                            <th className="p-4 hover:bg-gray-100 transition" onClick={() => handleSort('date')}>Date <ArrowUpDown size={12} className="inline ml-1 opacity-50" /></th>
                            <th className="p-4 hover:bg-gray-100 transition" onClick={() => handleSort('total')}>Total <ArrowUpDown size={12} className="inline ml-1 opacity-50" /></th>
                            <th className="p-4 hover:bg-gray-100 transition" onClick={() => handleSort('method')}>Method <ArrowUpDown size={12} className="inline ml-1 opacity-50" /></th>
                            <th className="p-4 hover:bg-gray-100 transition" onClick={() => handleSort('status')}>Status <ArrowUpDown size={12} className="inline ml-1 opacity-50" /></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedOrders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-500">
                                    No orders found for this period.
                                </td>
                            </tr>
                        ) : (
                            sortedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors text-sm">
                                    <td className="p-4 font-mono">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-blue-600 hover:text-blue-800 font-medium underline"
                                        >
                                            #{order.id}
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
                                        {/* Status Control */}
                                        {order.method === 'cash' ? (
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className={`text-xs font-bold capitalize border-0 bg-transparent py-1 px-2 rounded-full cursor-pointer focus:ring-2 focus:ring-blue-500 ${order.status === 'paid' ? 'text-blue-700 bg-blue-100' : 'text-yellow-700 bg-yellow-100'
                                                    }`}
                                            >
                                                <option value="pending_payment">Pending</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold capitalize ${order.status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        )}
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
                                    <p className="font-mono text-xl font-bold">{selectedOrder.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Total</p>
                                    <p className="text-2xl font-bold text-primary">€{selectedOrder.total.toFixed(2)}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-3">Items</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items && (Array.isArray(selectedOrder.items)
                                        ? selectedOrder.items
                                        : Object.entries(selectedOrder.items).map(([id, qty]) => ({ id, quantity: qty }))
                                    ).map((item: any) => {
                                        // Handle both Array (full object) and Map (reconstructed) formats
                                        const id = item.id;
                                        const qty = item.quantity;
                                        // If product is in map use it, else if item has name use it (legacy/cash)
                                        const product = productMap[id] || (item.name ? item : null);

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
                                                <span className="font-bold text-gray-700">x{qty}</span>
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
