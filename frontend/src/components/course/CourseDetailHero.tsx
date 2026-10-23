'use client';

import React from 'react';
import Link from 'next/link';
import { Headphones, Clock, Share2 } from 'lucide-react';

interface HeroProps {
  title: string;
  level: string;
  duration: string;
  sessionsCount: number;
  description?: string;
  dict: Record<string, string>;
  currentLang: string;
  toLocale: (val: number | string) => string;
}

export function CourseDetailHero({
  title, level, duration, sessionsCount, description, dict, currentLang, toLocale,
}: HeroProps) {
  const credentials = currentLang === 'en'
    ? 'Lecturer of Advanced Seminary Studies • Commentator on Transcendent Philosophy'
    : currentLang === 'ar' ? 'أستاذ السطوح العليا في الحوزة العلمية • شارح الأسفار الأربعة'
    : 'مدرس سطوح عالی حوزه • شارح حکمت متعالیه و اسفار';

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert(currentLang === 'en' ? 'Link copied.' : currentLang === 'ar' ? 'تم نسخ الرابط.' : 'پیوند دوره کپی شد.');
    }
  };

  return (
    <div className="space-y-6">
      <nav aria-label="نشانی مسیر" className="flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-400">
        <Link href="/" className="hover:text-[#8A532B]">{dict.nav_home || 'صفحه اصلی'}</Link>
        <span>/</span>
        <Link href="/courses" className="hover:text-[#8A532B]">{dict.nav_courses || 'دوره‌ها'}</Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100 line-clamp-1">{title}</span>
      </nav>
      <header className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] text-xs sm:text-sm font-bold">{level}</span>
            <span className="px-3 py-1 rounded bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] text-xs sm:text-sm font-bold flex items-center gap-2">
              <Headphones className="w-4 h-4" /><span>{dict.hero_feature_stream || 'پخش آنلاین'}</span>
            </span>
          </div>
          <button type="button" onClick={handleShare} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer" title="اشتراک‌گذاری دوره" aria-label="اشتراک‌گذاری دوره">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">{title}</h1>
        {description && <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify max-w-4xl pt-1">{description}</p>}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/images/ostad_zanjirzan.jpg" alt="حجت الاسلام دکتر زنجیر زن حسینی" className="w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700" />
            <div className="min-w-0">
              <span className="block text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">حجت الاسلام دکتر زنجیر زن حسینی</span>
              <span className="block text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">{credentials}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 font-num">
            <div className="flex items-center gap-2"><Headphones className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" /><span>{duration}</span></div>
            <span>•</span>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" /><span>{toLocale(sessionsCount)} {dict.course_unit_sessions || 'جلسه'}</span></div>
          </div>
        </div>
      </header>
    </div>
  );
}
