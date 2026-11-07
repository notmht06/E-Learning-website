'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  BookOpen,
  GraduationCap,
  Map,
  ArrowRight,
  ArrowLeft,
  Search,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import { SCHOLAR_NAME } from '@/lib/constants';

export default function NotFoundPage() {
  const router = useRouter();
  const { currentLang, dict, localizeHref } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(localizeHref(`/courses?q=${encodeURIComponent(query)}`));
  };

  const pathways = [
    {
      title: 'درس‌گفتارهای صوتی و تصویری',
      desc: 'کاوش در جلسات تدریس منطق، حکمت اشراق، اسفار اربعه و دروس خارج',
      href: '/courses',
      icon: GraduationCap,
      code: '۰۱',
    },
    {
      title: 'کتابخانه مقالات و رسالات برهانی',
      desc: 'مطالعه جستارهای تخصصی، شروح متن و پژوهش‌های تنقیح‌شده',
      href: '/articles',
      icon: BookOpen,
      code: '۰۲',
    },
    {
      title: 'کتاب‌ها و منشورات مکتوب',
      desc: 'بررسی آثار مکتوب، شروح روایی و کتب حکمت عملی و نظری',
      href: '/books',
      icon: Compass,
      code: '۰۳',
    },
    {
      title: 'نقشه جامع سیر مطالعاتی',
      desc: 'برنامه ترتیبی و گام‌به‌گام گذران منظومه معارف عقلی و فلسفی',
      href: '/roadmap',
      icon: Map,
      code: '۰۴',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#0C0D0E] dark:text-[#FAF8F5] transition-colors selection:bg-[#8A532B]/20 selection:text-[#8A532B]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Architectural 404 Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#8A532B]/30 dark:border-[#C58B43]/30 bg-[#8A532B]/5 dark:bg-[#C58B43]/10 text-[#8A532B] dark:text-[#C58B43] text-xs font-medium tracking-wide mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
          <span>مقام حیرت • خطای ۴۰۴</span>
          <span className="text-zinc-400 dark:text-zinc-500">|</span>
          <span className="font-mono text-[11px]">وجدان‌نشده در این نشانی</span>
        </div>

        {/* Large Monolithic 404 Display */}
        <div className="relative mb-6 select-none">
          <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-[#0C0D0E]/10 dark:text-white/5 font-mono select-none">
            ۴۰۴
          </h1>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0C0D0E] dark:text-[#FAF8F5] tracking-tight">
              مسیر درخواستی یافت نشد
            </span>
            <span className="text-xs sm:text-sm text-[#8A532B] dark:text-[#C58B43] font-medium mt-1">
              ساحت عدم ملکه در مراتب محتوای پایگاه
            </span>
          </div>
        </div>

        {/* Philosophical Body */}
        <div className="max-w-2xl mx-auto space-y-3 mb-8">
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            محتوا یا نشانی مورد نظر در سامانه موجود نیست و یا جابه‌جا شده است. در نظام برهانی و مراتب اندیشه، نرسیدن به یک ساحت مانع از گام‌نهادن در سایر افق‌های دانایی نیست.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            تحت اشراف علمی و دروس رسمی{' '}
            <strong className="text-[#0C0D0E] dark:text-[#FAF8F5] font-semibold">
              {SCHOLAR_NAME}
            </strong>
          </p>
        </div>

        {/* In-place Search Bar */}
        <form
          onSubmit={handleSearch}
          className="max-w-xl w-full mx-auto mb-10 flex items-center bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-1.5 shadow-2xs focus-within:border-[#8A532B] dark:focus-within:border-[#C58B43] transition-colors"
        >
          <div className="pr-3 pl-2 text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی عنوان درسگفتار، کتاب، رساله یا اصطلاح حکمی..."
            className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-[#0C0D0E] dark:text-[#FAF8F5] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 px-2 py-2 text-start"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            <span>کاوش</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </button>
        </form>

        {/* 4 Philosophical Pathways */}
        <div className="w-full max-w-4xl mb-10 text-start">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-bold text-[#0C0D0E] dark:text-[#FAF8F5] flex items-center gap-2">
              <span className="w-1 h-3 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
              سیرهای پیشنهادی جهت پیگیری مباحث
            </span>
            <span className="text-[11px] text-zinc-400">۴ مسیر برگزیده</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {pathways.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={localizeHref(item.href)}
                  className="group relative p-4 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] hover:border-[#8A532B] dark:hover:border-[#C58B43] transition-all duration-200 flex items-start gap-3.5 shadow-2xs hover:shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] dark:bg-[#1C1E22] border border-[#E6E1D8] dark:border-[#282A32] group-hover:border-[#8A532B]/40 group-hover:bg-[#8A532B]/10 dark:group-hover:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xs sm:text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5] group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition-colors truncate">
                        {item.title}
                      </h2>
                      <span className="text-[10px] font-mono text-zinc-400 group-hover:text-[#8A532B] transition-colors">
                        {item.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Return Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={localizeHref('/')}
            className="px-5 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <span>بازگشت به صفحه نخست</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>بازگشت به صفحه پیشین</span>
          </button>
        </div>
      </main>
    </div>
  );
}
