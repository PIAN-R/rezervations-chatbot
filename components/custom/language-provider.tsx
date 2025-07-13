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
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

function interpolate(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
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

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
    const initial = (stored && LANGS.includes(stored as Lang) ? (stored as Lang) : 'en');
    setLangState(initial);
  }, []);

  useEffect(() => {
    loadTranslations(lang).then(setTranslations);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    const str = translations[key] || key;
    return interpolate(str, vars);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
} 