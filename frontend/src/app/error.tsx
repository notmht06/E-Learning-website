'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { localizeHref } = useLanguage();
  useEffect(() => {
    console.error('Hayat Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#0C0D0E] dark:text-[#FAF8F5] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-medium tracking-wide text-[#8A532B] dark:text-[#C58B43] block">
            سامانه بازیابی و پایش پایداری
          </span>
          <h1 className="text-lg sm:text-xl font-bold">
            اختلال موقت در نمایش این بخش
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            در بارگذاری اطلاعات این صفحه خطایی رخ داده است. می‌توانید صفحه را مجدداً بارگذاری کنید یا به صفحه اصلی بازگردید.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تلاش مجدد</span>
          </button>

          <Link
            href={localizeHref('/')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E6E1D8] dark:border-[#262830] text-xs font-bold flex items-center justify-center gap-2 hover:border-[#8A532B] transition"
          >
            <span>صفحه نخست</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
