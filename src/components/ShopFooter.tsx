"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle } from "lucide-react";

export default function ShopFooter({ whatsapp }: { whatsapp?: string | null }) {
    const { t } = useLanguage();

    if (!whatsapp) return null;

    return (
        <div className="flex justify-center pb-32 pt-12">
            <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-emerald-600 hover:text-emerald-700 transition group"
            >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                    <MessageCircle size={24} />
                </div>
                <span className="font-medium text-sm">Need Help?</span>
            </a>
        </div>
    );
}
