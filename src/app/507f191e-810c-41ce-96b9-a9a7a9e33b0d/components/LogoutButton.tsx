"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/507f191e-810c-41ce-96b9-a9a7a9e33b0d/login");
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition"
        >
            <LogOut size={20} /> Logout
        </button>
    );
}
