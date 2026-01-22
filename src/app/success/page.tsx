import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in zoom-in duration-500">
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
        </div>
    );
}
