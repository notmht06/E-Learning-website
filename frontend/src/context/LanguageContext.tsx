'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

function detectUrlLocale(): SupportedLang | null {
  if (typeof window === 'undefined') return null;
  const seg = window.location.pathname.split('/')[1];
  if (seg === 'en' || seg === 'ar' || seg === 'fa') return seg as SupportedLang;
  return null;
}

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLang?: SupportedLang;
}> = ({ children, initialLang = 'fa' }) => {
  const [currentLang, setCurrentLangState] = useState<SupportedLang>(initialLang);

  const localizeHref = useCallback(
    (path: string): string => {
      if (!path) return path;

      // Handle full absolute URLs (e.g. http://localhost:3000/courses or https://zanjirzan.ir/courses)
      if (path.startsWith('http://') || path.startsWith('https://')) {
        try {
          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zanjirzan.ir';
          const parsed = new URL(path, origin);
          const isSameOrigin = typeof window !== 'undefined'
            ? parsed.origin === window.location.origin
            : (parsed.hostname === 'zanjirzan.ir' || parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');

          if (!isSameOrigin) {
            return path;
          }
          path = parsed.pathname + parsed.search + parsed.hash;
        } catch {
          return path;
        }
      }

      if (
        path.startsWith('#') ||
        path.startsWith('mailto:') ||
        path.startsWith('tel:') ||
        path.startsWith('javascript:') ||
        path.startsWith('/api') ||
        path.startsWith('/stream') ||
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path.startsWith('/images') ||
        path.startsWith('/fonts') ||
        path.startsWith('/audio') ||
        path.startsWith('/sample-books')
      ) {
        return path;
      }
      let clean = path.replace(/^\/(fa|en|ar)(\/|$)/, '/') || '/';
      if (!clean.startsWith('/')) clean = '/' + clean;

      if (clean.startsWith('/?')) {
        const query = clean.slice(1);
        if (currentLang === 'en') return `/en${query}`;
        if (currentLang === 'ar') return `/ar${query}`;
        return clean;
      }

      if (clean.startsWith('/#')) {
        const hash = clean.slice(1);
        if (currentLang === 'en') return `/en${hash}`;
        if (currentLang === 'ar') return `/ar${hash}`;
        return clean;
      }

      if (currentLang === 'en') return clean === '/' ? '/en' : `/en${clean}`;
      if (currentLang === 'ar') return clean === '/' ? '/ar' : `/ar${clean}`;
      return clean;
    },
    [currentLang]
  );

  const localizeHrefRef = useRef(localizeHref);
  useEffect(() => {
    localizeHrefRef.current = localizeHref;
  }, [localizeHref]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlLocale = detectUrlLocale();
      const cookieLang = getCookie('zan_lang') as SupportedLang | null;
      let savedLang: SupportedLang | null = null;
      try {
        savedLang = (localStorage.getItem('zan_lang') as SupportedLang | null);
      } catch (err) {
        console.warn('Could not read zan_lang from localStorage:', err);
      }

      const activeLang = urlLocale || cookieLang || savedLang;

      if (activeLang && (activeLang === 'fa' || activeLang === 'ar' || activeLang === 'en')) {
        setCurrentLangState(activeLang);
        document.documentElement.lang = activeLang;
        document.documentElement.dir = activeLang === 'en' ? 'ltr' : 'rtl';
        setCookie('zan_lang', activeLang);
        try {
          localStorage.setItem('zan_lang', activeLang);
        } catch (err) {
          console.warn('Could not persist zan_lang to localStorage:', err);
        }
      } else {
        setCookie('zan_lang', initialLang);
      }

      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      const localizeUrlArg = (url?: string | URL | null): string | URL | null | undefined => {
        if (!url) return url;
        if (typeof url === 'string') {
          return localizeHrefRef.current(url);
        }
        if (typeof url === 'object' && url instanceof URL) {
          const localized = localizeHrefRef.current(url.pathname + url.search + url.hash);
          return new URL(localized, url.origin);
        }
        return url;
      };

      window.history.pushState = function (state: any, title: string, url?: string | URL | null) {
        const target = localizeUrlArg(url);
        return originalPushState.apply(this, [state, title, target]);
      };

      window.history.replaceState = function (state: any, title: string, url?: string | URL | null) {
        const target = localizeUrlArg(url);
        return originalReplaceState.apply(this, [state, title, target]);
      };

      const handlePopState = () => {
        const currentUrlLocale = detectUrlLocale();
        if (currentUrlLocale && (currentUrlLocale === 'fa' || currentUrlLocale === 'ar' || currentUrlLocale === 'en')) {
          setCurrentLangState(currentUrlLocale);
          document.documentElement.lang = currentUrlLocale;
          document.documentElement.dir = currentUrlLocale === 'en' ? 'ltr' : 'rtl';
          setCookie('zan_lang', currentUrlLocale);
          try {
            localStorage.setItem('zan_lang', currentUrlLocale);
          } catch (e) {
            console.warn(e);
          }
        } else if (!currentUrlLocale) {
          const saved = (getCookie('zan_lang') as SupportedLang) || 'fa';
          if (saved === 'en' || saved === 'ar') {
            setCurrentLangState(saved);
            document.documentElement.lang = saved;
            document.documentElement.dir = saved === 'en' ? 'ltr' : 'rtl';
            const cleanPath = window.location.pathname;
            const search = window.location.search;
            const hash = window.location.hash;
            originalReplaceState.call(window.history, {}, '', `/${saved}${cleanPath === '/' ? '' : cleanPath}${search}${hash}`);
          } else {
            setCurrentLangState('fa');
            document.documentElement.lang = 'fa';
            document.documentElement.dir = 'rtl';
            setCookie('zan_lang', 'fa');
            try {
              localStorage.setItem('zan_lang', 'fa');
            } catch (e) {
              console.warn(e);
            }
          }
        }
      };

      const patchAnchorHref = (anchor: HTMLAnchorElement | null) => {
        if (!anchor) return;
        const rawHref = anchor.getAttribute('href');
        if (!rawHref) return;
        const localized = localizeHrefRef.current(rawHref);
        if (localized !== rawHref) {
          anchor.setAttribute('href', localized);
        }
      };

      const handleDocumentClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const anchor = target.closest('a');
        patchAnchorHref(anchor);
      };

      const handleDocumentMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const anchor = target.closest('a');
        patchAnchorHref(anchor);
      };

      window.addEventListener('popstate', handlePopState);
      document.addEventListener('click', handleDocumentClick, true);
      document.addEventListener('mouseover', handleDocumentMouseOver, true);

      return () => {
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
        window.removeEventListener('popstate', handlePopState);
        document.removeEventListener('click', handleDocumentClick, true);
        document.removeEventListener('mouseover', handleDocumentMouseOver, true);
      };
    }
  }, [initialLang]);

  const setLanguage = useCallback((lang: SupportedLang) => {
    setCurrentLangState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('zan_lang', lang);
      } catch (err) {
        console.warn('Could not persist zan_lang on language switch:', err);
      }
      setCookie('zan_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';

      // Update browser URL path to reflect /en, /ar, or root / for Persian
      const currentPath = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      const cleanPath = currentPath.replace(/^\/(fa|en|ar)(\/|$)/, '/') || '/';
      const nextPath =
        lang === 'fa'
          ? (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath)
          : `/${lang}${cleanPath === '/' ? '' : cleanPath}`;

      if (nextPath !== currentPath) {
        window.history.pushState({}, '', `${nextPath}${search}${hash}`);
      }
    }
  }, []);

  const isRtl = currentLang !== 'en';
  const dir: 'rtl' | 'ltr' = isRtl ? 'rtl' : 'ltr';

  const dict: Dictionary = useMemo(
    () => dictionaries[currentLang] || dictionaries.fa,
    [currentLang]
  );

  const toLocale = useCallback(
    (val: number | string, lang?: SupportedLang): string => {
      return toLocaleDigits(val, lang || currentLang);
    },
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

  const value = useMemo(
    () => ({
      currentLang,
      setLanguage,
      dict,
      isRtl,
      dir,
      toLocale,
      t,
      localizeHref,
    }),
    [currentLang, setLanguage, dict, isRtl, dir, toLocale, t, localizeHref]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useLocalizedPath = () => {
  const { localizeHref, currentLang, isRtl } = useLanguage();
  return { localizeHref, currentLang, isRtl };
};
