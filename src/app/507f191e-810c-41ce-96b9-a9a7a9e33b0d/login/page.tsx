"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [headerText, setHeaderText] = useState("Admin Access");
    const [passwordError, setPasswordError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(false);
        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        if (res.ok) {
            router.push("/507f191e-810c-41ce-96b9-a9a7a9e33b0d");
            router.refresh(); // Refresh to update layout state
        } else {
            setHeaderText("Access Denied");
            setPasswordError(true);
            setTimeout(() => setHeaderText("Admin Access"), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
            <div className={`bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm transition-transform duration-300 ${passwordError ? 'shake' : ''}`}>
                <div className="flex flex-col items-center mb-8">
                    <div className={`w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center text-white mb-4 transition-colors duration-300 ${passwordError ? 'bg-red-600' : ''}`}>
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{headerText}</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter Password"
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-stone-900 text-white py-3 rounded-lg font-bold hover:bg-stone-800 transition transform active:scale-95"
                    >
                        Login
                    </button>
                </form>

                <style jsx>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                    .shake { animation: shake 0.4s ease-in-out; }
                `}</style>
            </div>
        </div>
    );
}
