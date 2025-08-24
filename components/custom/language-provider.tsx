"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Supported languages
const LANGS = ['en', 'ro', 'ru'] as const;
type Lang = typeof LANGS[number];

// Type for translation dictionary
export type Translations = Record<string, string>;

interface LanguageContextProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  isLoading: boolean;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

function interpolate(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str;
  // Handle both single curly braces {key} and double curly braces {{key}}
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`))
             .replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

const loadTranslations = async (lang: Lang): Promise<Translations> => {
  switch (lang) {
    case 'ro':
      return (await import('../../locales/ro.json')).default;
    case 'ru':
      return (await import('../../locales/ru.json')).default;
    default:
      return (await import('../../locales/en.json')).default;
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('en');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
    const initial = (stored && LANGS.includes(stored as Lang) ? (stored as Lang) : 'en');
    setLangState(initial);
  }, []);

  useEffect(() => {
    console.log("Loading translations for language:", lang);
    setIsLoading(true);
    loadTranslations(lang).then((loadedTranslations) => {
      console.log("Translations loaded:", Object.keys(loadedTranslations).length, "keys");
      setTranslations(loadedTranslations);
      setIsLoading(false);
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    if (isLoading) {
      console.log("Translations still loading, returning key:", key);
      return key; // Return key while loading to avoid showing raw keys
    }
    const str = translations[key] || key;
    console.log("Translation lookup:", { key, found: !!translations[key], result: str });
    return interpolate(str, vars);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isLoading, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
} 