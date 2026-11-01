'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  BookOpen,
  Headphones,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { AudioCourse } from '@/lib/data';
import { getScholarName } from '@/lib/constants';
import { HeroInstantSearch } from './home/HeroInstantSearch';

interface BentoHeroProps {
  heroCourse?: AudioCourse;
  onOpenBookReader?: (bookId: string) => void;
}

export function BentoHero({}: BentoHeroProps) {
  const { currentLang, dict, toLocale, localizeHref = (p) => p } = useLanguage();
  const { siteConfig } = useData();

  const heroBadge =
    (currentLang === 'fa' && siteConfig?.hero_title_fa)
      ? siteConfig.hero_title_fa
      : (currentLang === 'ar' && siteConfig?.hero_title_ar)
      ? siteConfig.hero_title_ar
      : (currentLang === 'en' && siteConfig?.hero_title_en)
      ? siteConfig.hero_title_en
      : dict.hero_badge;

  const scholarTitle =
    (currentLang === 'fa' && siteConfig?.scholar_name_fa)
      ? siteConfig.scholar_name_fa
      : (currentLang === 'ar' && siteConfig?.scholar_name_ar)
      ? siteConfig.scholar_name_ar
      : (currentLang === 'en' && siteConfig?.scholar_name_en)
      ? siteConfig.scholar_name_en
      : (dict.scholar_name || getScholarName(currentLang));

  const subtitle =
    (currentLang === 'fa' && siteConfig?.hero_subtitle_fa)
      ? siteConfig.hero_subtitle_fa
      : (currentLang === 'ar' && siteConfig?.hero_subtitle_ar)
      ? siteConfig.hero_subtitle_ar
      : (currentLang === 'en' && siteConfig?.hero_subtitle_en)
      ? siteConfig.hero_subtitle_en
      : dict.hero_subtitle;

  const coursesBtn = dict.hero_all_courses_btn || dict.nav_courses;
  const roadmapBtn = dict.hero_roadmap_btn || dict.nav_roadmap;
  const booksBtn = dict.hero_books_btn || dict.nav_books;

  const numFont = currentLang === 'en' ? 'font-mono' : 'font-sans';

  return (
    <section id="hero" className="max-w-5xl mx-auto px-4 sm:px-6 w-full pt-4 sm:pt-6 pb-2">
      {/* Folio Outer Frame with 4-Corner Traditional Accents */}
      <div className="relative rounded-3xl border border-[#E6E1D8] dark:border-[#27282D] bg-[#FAF8F5]/80 dark:bg-[#111215]/80 backdrop-blur-md p-6 sm:p-10 text-center space-y-6 sm:space-y-8 shadow-xs overflow-hidden">
        {/* 4 Traditional Corner Brackets (نشان‌های ۴گوشه هندسی دارالحکمه و سبزلرن) */}
        <span
          className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#8A532B]/70 dark:border-[#C58B43]/70 pointer-events-none"
          aria-hidden="true"
        />
        <span
          className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#8A532B]/70 dark:border-[#C58B43]/70 pointer-events-none"
          aria-hidden="true"
        />
        <span
          className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#8A532B]/70 dark:border-[#C58B43]/70 pointer-events-none"
          aria-hidden="true"
        />
        <span
          className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#8A532B]/70 dark:border-[#C58B43]/70 pointer-events-none"
          aria-hidden="true"
        />

        {/* 1. Top Scholar Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-[#8A532B]/10 dark:bg-[#C58B43]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/20 mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
          <span>{heroBadge}</span>
        </div>

        {/* 2. Official Scholar Title & Subtitle */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
            {scholarTitle}
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* 3. Hero Instant Search Console with Hotkey and Live Dropdown */}
        <div className="pt-1">
          <HeroInstantSearch />
        </div>

        {/* 4. Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href={localizeHref('/courses')}
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#8A532B] hover:bg-[#734320] text-white text-xs sm:text-sm font-medium shadow-xs transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Headphones className="w-4 h-4" />
            <span>{coursesBtn}</span>
          </Link>
          <Link
            href={localizeHref('/roadmap')}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#16171B] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-medium transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
          >
            <Compass className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
            <span>{roadmapBtn}</span>
          </Link>
          <Link
            href={localizeHref('/books')}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#16171B] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-medium transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
            <span>{booksBtn}</span>
          </Link>
        </div>

        {/* 5. Three Architectural Value Pillars (۳ ستون ارزش محوری سبزلرن و دارالحکمه) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-[#E6E1D8]/80 dark:border-[#27282D]/80 text-start">
          {/* Pillar 1 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-[#141518]/70 border border-[#E6E1D8] dark:border-[#27282D] space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-lg sm:text-xl font-bold text-[#8A532B] dark:text-[#C58B43] tabular-nums ${numFont}`}>
                {siteConfig?.stat_sessions ? `${toLocale(siteConfig.stat_sessions)}+` : dict.hero_stat_1_num}
              </span>
              <Layers className="w-4 h-4 text-[#8A532B]/60 dark:text-[#C58B43]/60" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {dict.hero_stat_1_title}
            </h4>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {dict.hero_stat_1_desc}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-[#141518]/70 border border-[#E6E1D8] dark:border-[#27282D] space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-lg sm:text-xl font-bold text-[#8A532B] dark:text-[#C58B43] tabular-nums ${numFont}`}>
                {siteConfig?.stat_books ? toLocale(siteConfig.stat_books) : dict.hero_stat_2_num}
              </span>
              <Compass className="w-4 h-4 text-[#8A532B]/60 dark:text-[#C58B43]/60" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {dict.hero_stat_2_title}
            </h4>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {dict.hero_stat_2_desc}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-[#141518]/70 border border-[#E6E1D8] dark:border-[#27282D] space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-lg sm:text-xl font-bold text-[#8A532B] dark:text-[#C58B43] tabular-nums ${numFont}`}>
                {siteConfig?.stat_students ? `${toLocale(siteConfig.stat_students)}+` : dict.hero_stat_3_num}
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#8A532B]/60 dark:text-[#C58B43]/60" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {dict.hero_stat_3_title}
            </h4>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {dict.hero_stat_3_desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
