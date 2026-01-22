"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Minus, ShoppingBag, X, CreditCard, Banknote } from "lucide-react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useLanguage } from "../contexts/LanguageContext";

type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
};

type CartItem = Product & { quantity: number };

export default function Store({ products }: { products: Product[] }) {
    const { t } = useLanguage();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    // Dynamic stripe loaded from API
    const [stripe, setStripe] = useState<Stripe | null>(null);

    // Initialise Stripe
    useEffect(() => {
        fetch("/api/config/stripe")
            .then(res => res.json())
            .then(async data => {
                if (data.publishableKey) {
                    const stripeInstance = await loadStripe(data.publishableKey);
                    setStripe(stripeInstance);
                }
            });
    }, []);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev; // Limit to stock
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) => {
            return prev.map((item) => {
                if (item.id === productId) {
                    const newQty = Math.max(0, item.quantity + delta);
                    // Check stock limit if increasing
                    const product = products.find(p => p.id === productId);
                    if (product && newQty > product.stock) return item;
                    return { ...item, quantity: newQty };
                }
                return item;
            }).filter((item) => item.quantity > 0);
        });
    };

    const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleStripeCheckout = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch("/api/checkout_sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: cart }),
            });
            const { url, error } = await response.json();
            if (error) {
                alert(t('error_payment') + ": " + error);
                setIsProcessing(false);
                return;
            }
            if (url) {
                window.location.href = url;
            }
        } catch (err) {
            console.error(err);
            alert(t('error_generic'));
            setIsProcessing(false);
        }
    };

    const handleCashCheckout = async () => {
        if (!confirm(t('confirm_cash'))) return;
        setIsProcessing(true);
        try {
            const response = await fetch("/api/cash", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: cart, total: cartTotal }),
            });
            const data = await response.json();
            if (data.success) {
                window.location.href = "/success?method=cash";
            } else {
                alert("Error: " + data.error);
                setIsProcessing(false);
            }
        } catch (err) {
            console.error(err);
            alert(t('error_generic'));
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 gap-6 pb-24">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-center">
                        <div className="relative w-24 h-24 flex-shrink-0 bg-stone-100 rounded-xl overflow-hidden">
                            {/* Using a placeholder for now if image fails, or real image */}
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-400">
                                {product.image ? <Image src={product.image} alt={product.name} fill className="object-cover" /> : "No Image"}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                            <p className="text-sm text-stone-500 mb-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-primary text-xl">€{product.price.toFixed(2)}</span>
                                {product.stock > 0 ? (
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg active:scale-90 transition"
                                    >
                                        <Plus size={18} />
                                    </button>
                                ) : (
                                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">{t('out_of_stock')}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Cart Button */}
            {cartCount > 0 && (
                <div className="fixed bottom-6 left-0 right-0 px-6 z-40">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full bg-primary text-white p-4 rounded-full shadow-xl flex items-center justify-between font-bold animate-in slide-in-from-bottom duration-300"
                    >
                        <div className="flex items-center gap-2">
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{cartCount}</span>
                            <span>{t('view_cart')}</span>
                        </div>
                        <span>€{cartTotal.toFixed(2)}</span>
                    </button>
                </div>
            )}

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    {/* Click backdrop to close */}
                    <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

                    <div className="relative bg-[#F5F5DC] w-full max-w-md mx-auto rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-handwriting text-primary">{t('your_essentials')}</h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 bg-stone-200 rounded-full hover:bg-stone-300">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{item.name}</span>
                                        <span className="text-sm text-stone-500">€{item.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-stone-100 rounded-full px-2 py-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1"><Minus size={14} /></button>
                                        <span className="font-mono text-sm w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1"><Plus size={14} /></button>
                                    </div>
                                </div>
                            ))}
                            {cart.length === 0 && <p className="text-center text-stone-400 py-8">{t('empty_cart')}</p>}
                        </div>

                        {cart.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex justify-between text-xl font-bold mb-4 border-t border-stone-200 pt-4">
                                    <span>{t('total')}</span>
                                    <span>€{cartTotal.toFixed(2)}</span>
                                </div>

                                <div className="text-center text-sm text-stone-500 mb-2">
                                    {t('checkout_secure_msg')}
                                </div>

                                <button
                                    disabled={isProcessing}
                                    onClick={handleStripeCheckout}
                                    className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                                >
                                    <CreditCard size={18} /> {t('pay_card')}
                                </button>
                                <button
                                    disabled={isProcessing}
                                    onClick={handleCashCheckout}
                                    className="w-full py-3.5 bg-secondary text-white rounded-xl font-bold hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                                >
                                    <Banknote size={18} /> {t('pay_cash')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
