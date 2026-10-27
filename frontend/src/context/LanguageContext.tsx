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
        return;
      }

      // First-time visit: auto-detect by browser locale & timezone
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
          // Default to English for international visits outside Iran
          detected = 'en';
        }
      } catch {
        detected = initialLang;
      }

      // Apply and persist detected locale permanently
      setCurrentLangState(detected);
      document.documentElement.lang = detected;
      document.documentElement.dir = detected === 'en' ? 'ltr' : 'rtl';
      try {
        localStorage.setItem('zan_lang', detected);
      } catch {
        // storage disabled fallback
      }
      setCookie('zan_lang', detected);

      // Background Geo-IP verification for accurate international location
      try {
        fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout?.(2500) })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!data || !data.country_code) return;
            const country = String(data.country_code).toUpperCase();
            const ARAB_COUNTRIES = ['SA', 'AE', 'IQ', 'EG', 'KW', 'QA', 'BH', 'OM', 'LB', 'SY', 'JO', 'YE'];
            let resolved: SupportedLang = 'fa';
            if (country !== 'IR') {
              resolved = ARAB_COUNTRIES.includes(country) ? 'ar' : 'en';
            }
            if (resolved !== detected) {
              setCurrentLangState(resolved);
              document.documentElement.lang = resolved;
              document.documentElement.dir = resolved === 'en' ? 'ltr' : 'rtl';
              try {
                localStorage.setItem('zan_lang', resolved);
              } catch {}
              setCookie('zan_lang', resolved);
            }
          })
          .catch(() => {
            // Silently fall back to timezone/browser detection
          });
      } catch {
        // Ignore fetch errors
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
