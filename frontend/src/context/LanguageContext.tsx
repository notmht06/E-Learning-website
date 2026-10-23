'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  type SupportedLang,
  type Dictionary,
  type TranslationKey,
  type LanguageContextType,
  dictionaries,
} from '@/locales';
import { toLocaleDigits } from '@/lib/data';

export type { LanguageContextType };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLang?: SupportedLang;
}> = ({ children, initialLang = 'fa' }) => {
  const [currentLang, setCurrentLangState] = useState<SupportedLang>(initialLang);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookieLang = getCookie('zan_lang') as SupportedLang | null;
      const savedLang = (localStorage.getItem('zan_lang') as SupportedLang | null) || cookieLang;
      if (savedLang && (savedLang === 'fa' || savedLang === 'ar' || savedLang === 'en')) {
        setCurrentLangState(savedLang);
        document.documentElement.lang = savedLang;
        document.documentElement.dir = savedLang === 'en' ? 'ltr' : 'rtl';
        setCookie('zan_lang', savedLang);
      } else {
        setCookie('zan_lang', initialLang);
      }
    }
  }, [initialLang]);

  const setLanguage = useCallback((lang: SupportedLang) => {
    setCurrentLangState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('zan_lang', lang);
      } catch (err) {
        console.error('Failed to save language preference:', err);
      }
      setCookie('zan_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    }
  }, []);

  const isRtl = currentLang !== 'en';
  const dir: 'rtl' | 'ltr' = isRtl ? 'rtl' : 'ltr';
  const dict: Dictionary = useMemo(
    () => dictionaries[currentLang] || dictionaries.fa,
    [currentLang]
  );

  const toLocale = useCallback(
    (num: number | string) => toLocaleDigits(num, currentLang),
    [currentLang]
  );

  const t = useCallback(
    (key: TranslationKey | string, fallback?: string): string => {
      return (dict as Record<string, string>)[key] || fallback || key;
    },
    [dict]
  );

  const value = useMemo(
    () => ({
      currentLang,
      setLanguage,
      dict,
      isRtl,
      dir,
      toLocale,
      t,
    }),
    [currentLang, setLanguage, dict, isRtl, dir, toLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
