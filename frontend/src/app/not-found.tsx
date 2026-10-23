'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Compass, Search } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import { SCHOLAR_NAME } from '@/lib/constants';

export default function NotFoundPage() {
  const { currentLang, dict } = useLanguage();

  const title =
    currentLang === 'en'
      ? 'Page or Treatise Not Found'
      : currentLang === 'ar'
      ? 'لم يتم العثور على الصفحة المطلوبة'
      : 'صفحه یا اثر مورد نظر یافت نشد';

  const subtitle =
    currentLang === 'en'
      ? 'The requested address does not exist in the Hayat archive, or its link has been updated.'
      : currentLang === 'ar'
      ? 'العنوان الذي تبحث عنه غير موجود في أرشيف حياة أو تم نقل الرابط.'
      : 'نشانی واردشده در آرشیو پایگاه حیات موجود نیست و یا مسیر آن تغییر یافته است.';

  const homeBtn =
    currentLang === 'en'
      ? 'Return to Homepage'
      : currentLang === 'ar'
      ? 'العودة إلى الصفحة الرئيسية'
      : 'بازگشت به صفحه نخست';

  const coursesBtn =
    currentLang === 'en'
      ? 'Browse Course Archive'
      : currentLang === 'ar'
      ? 'تصفح أرشيف الدورات'
      : 'مشاهده آرشیو دوره‌ها';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#0C0D0E] dark:text-[#FAF8F5] transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-3xl p-7 sm:p-10 text-center space-y-6 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center mx-auto border border-[#8A532B]/20">
            <BookOpen className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[#8A532B] dark:text-[#C58B43] tracking-wider uppercase block">
              [ HTTP 404 • ARCHIVE ENTRY NOT FOUND ]
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5] leading-snug">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#24262D] text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>{dict.scholar_name || SCHOLAR_NAME}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>{homeBtn}</span>
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
            </Link>

            <Link
              href="/courses"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FAF8F5] dark:bg-[#18191D] hover:border-[#8A532B] text-[#0C0D0E] dark:text-[#FAF8F5] border border-[#E6E1D8] dark:border-[#262830] text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Compass className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
              <span>{coursesBtn}</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
