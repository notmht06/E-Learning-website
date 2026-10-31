import type { fa } from './fa';

/**
 * زبان‌های پشتیبانی‌شده در پلتفرم حیات
 */
export type SupportedLang = 'fa' | 'ar' | 'en';

/**
 * استخراج خودکار کلیدهای ترجمه از فایل پایه فارسی (Single Source of Truth)
 */
export type TranslationKey = keyof typeof fa;

/**
 * تایپ سخت‌گیرانه دیکشنری جهت تضمین تقارن ۱۰۰٪ کلیدها در تمامی زبان‌ها
 * همراه با پشتیبانی از کلیدهای داینامیک قالبی
 */
export type Dictionary = Record<TranslationKey, string>;

/**
 * ساختار کانتکست بین‌المللی‌سازی سامانه
 */
export interface LanguageContextType {
  currentLang: SupportedLang;
  setLanguage: (lang: SupportedLang) => void;
  dict: Dictionary;
  isRtl: boolean;
  dir: 'rtl' | 'ltr';
  toLocale: (num: number | string, lang?: SupportedLang) => string;
  localizeHref?: (path: string) => string;
  t: (key: TranslationKey | string, fallback?: string) => string;
}
