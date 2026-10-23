import { fa } from './fa';
import { ar } from './ar';
import { en } from './en';
import type { SupportedLang, Dictionary, TranslationKey, LanguageContextType } from './types';

export * from './types';
export { fa, ar, en };

export const dictionaries: Record<SupportedLang, Dictionary> = {
  fa,
  ar,
  en,
};

/** پل سازگاری معکوس برای ایمپورت‌های i18nDict */
export const i18nDict: Record<SupportedLang, Dictionary> = dictionaries;

/** دریافت مستقیم دیکشنری بر اساس زبان */
export function getDictionary(lang: SupportedLang): Dictionary {
  return dictionaries[lang] || dictionaries.fa;
}

/** ساخت متد ترجمه مستقل برای استفاده خارج از کامپوننت‌های ری‌اکت */
export function createTranslator(lang: SupportedLang) {
  const dict = getDictionary(lang);
  return function t(key: TranslationKey | string, fallback?: string): string {
    return (dict as Record<string, string>)[key] || fallback || key;
  };
}
