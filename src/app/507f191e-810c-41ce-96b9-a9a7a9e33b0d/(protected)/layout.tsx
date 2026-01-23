import Link from "next/link";
import { Package, Home, Settings, QrCode, ShoppingBag } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "../components/LogoutButton";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");

    if (!token) {
        redirect("/507f191e-810c-41ce-96b9-a9a7a9e33b0d/login");
    }

    return (
        <>
            <div className="md:hidden flex items-center justify-center min-h-screen bg-gray-100 p-6 text-center print:hidden">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Desktop Only</h1>
                    <p className="text-gray-600">Please access the Admin Panel from a desktop computer.</p>
                </div>
            </div>

            <div className="hidden md:flex print:flex min-h-screen bg-gray-100 text-gray-900 font-sans">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 flex flex-col print:hidden">
                    <div className="p-6 border-b border-gray-100">
                        <span className="text-xl font-bold text-gray-800">Admin Panel</span>
                    </div>
                    <nav className="flex-1 p-4 space-y-2">
                        <Link href="/507f191e-810c-41ce-96b9-a9a7a9e33b0d" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            <Package size={20} /> Products
                        </Link>
                        <Link href="/507f191e-810c-41ce-96b9-a9a7a9e33b0d/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            <ShoppingBag size={20} /> Orders
                        </Link>
                        <Link href="/507f191e-810c-41ce-96b9-a9a7a9e33b0d/setup" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            <QrCode size={20} /> Setup QR Code
                        </Link>
                        <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            <Home size={20} /> View Storefront
                        </Link>
                        <Link href="/507f191e-810c-41ce-96b9-a9a7a9e33b0d/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            <Settings size={20} /> Settings
                        </Link>

                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <LogoutButton />
                        </div>
                    </nav>
                    <div className="p-4 border-t border-gray-100 text-xs text-gray-500">
                        Just in Case Admin v1.0
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <main className="flex-1 p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
