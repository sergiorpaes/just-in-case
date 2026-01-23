"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { locales, LocaleKey, TranslationKey } from "../lib/i18n/locales";

type LanguageContextType = {
    language: LocaleKey;
    setLanguage: (lang: LocaleKey) => void;
    t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<LocaleKey>("en");

    useEffect(() => {
        const browserLang = navigator.language.split("-")[0];
        if (["pt", "es", "fr", "de", "nl", "ru"].includes(browserLang)) {
            setLanguage(browserLang as LocaleKey);
        }
    }, []);

    const t = (key: TranslationKey) => {
        return locales[language][key] || locales["en"][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
