import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import { LanguageProvider } from "../../contexts/LanguageContext";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LanguageProvider>
            <div className="flex flex-col min-h-screen">
                <header className="flex flex-col items-center justify-center py-8 border-b border-stone-200/50">
                    <div className="relative w-full max-w-[300px] aspect-[2/1]">
                        <Image
                            src="/images/logo.png"
                            alt="Just in Case"
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    </div>
                </header>

                <main className="flex-1 max-w-md mx-auto px-4 py-6 w-full">
                    {children}
                </main>
            </div>
        </LanguageProvider>
    );
}
