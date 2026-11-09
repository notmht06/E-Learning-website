'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Headphones,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { getScholarName } from '@/lib/constants';
import { HeroInstantSearch } from './HeroInstantSearch';

export function VibeFarsiHero() {
  const { currentLang, dict, localizeHref = (p) => p } = useLanguage();
  const { siteConfig } = useData();

  const heroBadge =
    (currentLang === 'fa' && siteConfig?.hero_title_fa && siteConfig.hero_title_fa !== 'تست')
      ? siteConfig.hero_title_fa
      : (currentLang === 'ar' && siteConfig?.hero_title_ar)
      ? siteConfig.hero_title_ar
      : (currentLang === 'en' && siteConfig?.hero_title_en)
      ? siteConfig.hero_title_en
      : (dict.hero_badge || 'پایگاه رسمی دروس و آثار علوم عقلی');

  const subtitle =
    (currentLang === 'fa' && siteConfig?.hero_subtitle_fa && siteConfig.hero_subtitle_fa !== 'تست')
      ? siteConfig.hero_subtitle_fa
      : (currentLang === 'ar' && siteConfig?.hero_subtitle_ar)
      ? siteConfig.hero_subtitle_ar
      : (currentLang === 'en' && siteConfig?.hero_subtitle_en)
      ? siteConfig.hero_subtitle_en
      : (dict.hero_subtitle || 'ارائه اجتهادی و برهانی متون حکمت متعالیه، اشراق، منطق و اصول با استریم صوتی و تصویری، تقریرات منقح و همراهی دستیار هوشمند علمی.');

  const coursesBtn = dict.hero_all_courses_btn || dict.nav_courses || 'مشاهده درس‌گفتارها';
  const roadmapBtn = dict.hero_roadmap_btn || dict.nav_roadmap || 'سیر مطالعاتی و نقشه راه';

  return (
    <section id="hero" className="max-w-5xl mx-auto px-4 sm:px-6 w-full pt-4 sm:pt-8 pb-2">
      {/* Folio Outer Frame with 4-Corner Traditional Accents */}
      <div className="relative rounded-3xl border border-[#E6E1D8] dark:border-[#27282D] bg-[#FAF8F5]/90 dark:bg-[#111215]/90 backdrop-blur-md p-6 sm:p-10 space-y-6 sm:space-y-8 shadow-xs overflow-hidden text-center">
        {/* 4 Corner Brackets */}
        <span className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#8A532B]/70 dark:border-[#C58B43]/70 pointer-events-none" aria-hidden="true" />
        <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#8A532B]/70 dark:border-[#C58B43]/70 pointer-events-none" aria-hidden="true" />
        <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#8A532B]/70 dark:border-[#C58B43]/70 pointer-events-none" aria-hidden="true" />
        <span className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#8A532B]/70 dark:border-[#C58B43]/70 pointer-events-none" aria-hidden="true" />

        {/* 1. Scholar Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#8A532B]/10 dark:bg-[#C58B43]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/20 mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
          <span>{heroBadge}</span>
        </div>

        {/* 2. Official Scholar Title H1 & Subtitle */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug">
            {getScholarName(currentLang)}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed max-w-2xl mx-auto text-balance">
            {subtitle}
          </p>
        </div>

        {/* 3. Hero Instant Search Console */}
        <div className="pt-1">
          <HeroInstantSearch />
        </div>

        {/* 4. Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href={localizeHref('/courses')}
            className="px-6 py-2.5 sm:py-3 rounded-xl bg-[#8A532B] hover:bg-[#734320] text-white text-xs sm:text-sm font-bold shadow-xs transition duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Headphones className="w-4 h-4" />
            <span>{coursesBtn}</span>
          </Link>
          <Link
            href={localizeHref('/roadmap')}
            className="px-5 py-2.5 sm:py-3 rounded-xl border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#16171B] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-bold transition duration-200 flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
          >
            <Compass className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
            <span>{roadmapBtn}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default VibeFarsiHero;
