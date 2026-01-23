"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle } from "lucide-react";

export default function ShopHeader({ whatsapp }: { whatsapp?: string | null }) {
    const { t } = useLanguage();

    return (
        <div className="text-center space-y-2 py-4 relative">
            <p className="text-stone-600 text-lg">
                {t('welcome_message')}
            </p>

            {whatsapp && (
                <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm bg-emerald-50 px-4 py-2 rounded-full transition-colors"
                >
                    <MessageCircle size={18} />
                    <span>Support</span>
                </a>
            )}
        </div>
    );
}
