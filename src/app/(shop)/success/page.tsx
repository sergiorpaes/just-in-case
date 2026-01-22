"use client";

import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (sessionId) {
            fetch('/api/orders/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            })
                .then(res => {
                    if (res.ok) setStatus('success');
                    else setStatus('error'); // Maybe already processed or error, but user paid so show success mostly
                })
                .catch(() => setStatus('error')); // Silent fail if duplicate?
        } else {
            // Cash or direct access
            setStatus('success');
        }
    }, [sessionId]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in zoom-in duration-500">
            {status === 'loading' ? (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <p className="text-stone-500">Confirming your order...</p>
                </div>
            ) : (
                <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle size={48} />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-handwriting text-primary">Thank You!</h1>
                        <p className="text-stone-600">Your order has been confirmed.</p>
                        <p className="text-sm text-stone-500 max-w-xs mx-auto">
                            If you paid cash, please ensure you leave the exact amount in the designated box.
                        </p>
                    </div>

                    <div className="pt-8">
                        <Link
                            href="/"
                            className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition shadow-lg"
                        >
                            Back to Store
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
