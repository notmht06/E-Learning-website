'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  type SupportedLang,
  type Dictionary,
  type TranslationKey,
  dictionaries,
} from '@/locales';
import { toLocaleDigits } from '@/lib/data';

export interface LanguageContextType {
  currentLang: SupportedLang;
  setLanguage: (lang: SupportedLang) => void;
  dict: Dictionary;
  t: (key: TranslationKey | string, fallback?: string) => string;
  isRtl: boolean;
  dir: 'rtl' | 'ltr';
  toLocale: (val: number | string, lang?: SupportedLang) => string;
  localizeHref: (path: string) => string;
}

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
      const pathname = window.location.pathname;

      // 1. Check Subdirectory in URL first (/en or /ar)
      if (pathname === '/en' || pathname.startsWith('/en/')) {
        setCurrentLangState('en');
        document.documentElement.lang = 'en';
        document.documentElement.dir = 'ltr';
        setCookie('zan_lang', 'en');
        try { localStorage.setItem('zan_lang', 'en'); } catch {}
        return;
      }
      if (pathname === '/ar' || pathname.startsWith('/ar/')) {
        setCurrentLangState('ar');
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
        setCookie('zan_lang', 'ar');
        try { localStorage.setItem('zan_lang', 'ar'); } catch {}
        return;
      }

      // 2. Subdirectory architecture: Root paths without /en or /ar prefix represent default Persian (fa)
      setCurrentLangState('fa');
      document.documentElement.lang = 'fa';
      document.documentElement.dir = 'rtl';
      setCookie('zan_lang', 'fa');
      try { localStorage.setItem('zan_lang', 'fa'); } catch {}
      return;

      // 3. First-time visit: auto-detect by browser locale & timezone
      let detected: SupportedLang = initialLang;
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const navLangs = navigator.languages || [navigator.language || ''];
        const primary = (navLangs[0] || '').toLowerCase();

        const isArabicTz = /^(Asia\/Baghdad|Asia\/Riyadh|Asia\/Dubai|Africa\/Cairo|Asia\/Kuwait|Asia\/Beirut|Asia\/Damascus|Asia\/Amman|Asia\/Muscat|Asia\/Qatar|Asia\/Bahrain)/i.test(tz);
        const isTehranTz = tz === 'Asia/Tehran';

        if (primary.startsWith('ar') || isArabicTz) {
          detected = 'ar';
        } else if (primary.startsWith('fa') || isTehranTz) {
          detected = 'fa';
        } else {
          detected = 'en';
        }
      } catch {
        detected = initialLang;
      }

      setCurrentLangState(detected);
      document.documentElement.lang = detected;
      document.documentElement.dir = detected === 'en' ? 'ltr' : 'rtl';
      try {
        localStorage.setItem('zan_lang', detected);
      } catch {}
      setCookie('zan_lang', detected);
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

      // Update URL to match subdirectory (/en/..., /ar/..., or /...)
      const currentPath = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;

      let cleanPath = currentPath.replace(/^\/(en|ar)/, '') || '/';
      if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

      let newPath = cleanPath;
      if (lang === 'en') {
        newPath = cleanPath === '/' ? '/en' : `/en${cleanPath}`;
      } else if (lang === 'ar') {
        newPath = cleanPath === '/' ? '/ar' : `/ar${cleanPath}`;
      } else {
        newPath = cleanPath; // Default Persian is root /
      }

      if (newPath !== currentPath) {
        window.location.href = newPath + search + hash;
      }
    }
  }, []);

  const isRtl = currentLang !== 'en';
  const dir: 'rtl' | 'ltr' = isRtl ? 'rtl' : 'ltr';
  const dict: Dictionary = useMemo(
    () => dictionaries[currentLang] || dictionaries.fa,
    [currentLang]
  );

  const t = useCallback(
    (key: TranslationKey | string, fallback?: string): string => {
      const translation = (dict as Record<string, string>)[key];
      if (translation !== undefined) {
        return translation;
      }
      return (dictionaries.fa as Record<string, string>)[key] || fallback || String(key);
    },
    [dict]
  );

  const toLocale = useCallback(
    (val: number | string, lang?: SupportedLang): string => {
      return toLocaleDigits(val, lang || currentLang);
    },
    [currentLang]
  );

  const localizeHref = useCallback(
    (path: string): string => {
      if (path.startsWith('http') || path.startsWith('#') || path.startsWith('mailto:') || path.startsWith('tel:')) {
        return path;
      }
      let clean = path.replace(/^\/(en|ar)/, '') || '/';
      if (!clean.startsWith('/')) clean = '/' + clean;
      if (currentLang === 'en') return clean === '/' ? '/en' : `/en${clean}`;
      if (currentLang === 'ar') return clean === '/' ? '/ar' : `/ar${clean}`;
      return clean;
    },
    [currentLang]
  );

  const value = useMemo(
    () => ({
      currentLang,
      setLanguage,
      dict,
      t,
      isRtl,
      dir,
      toLocale,
      localizeHref,
    }),
    [currentLang, setLanguage, dict, t, isRtl, dir, toLocale, localizeHref]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
