"use client";

import { useLanguage } from "../contexts/LanguageContext";

export default function ShopHeader() {
    const { t } = useLanguage();

    return (
        <div className="text-center space-y-2 py-4">
            <p className="text-stone-600 text-lg">
                {t('welcome_message')}
            </p>
        </div>
    );
}
