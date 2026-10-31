'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  Brain,
  Compass,
  ShieldCheck,
  Sparkles,
  Scroll,
  Scale,
  BookOpen,
  HeartHandshake,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { getLocalizedCategory } from '@/lib/localization';
import { triggerTactileHaptic } from '@/lib/haptics';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Brain,
  Compass,
  ShieldCheck,
  Sparkles,
  Scroll,
  Scale,
  BookOpen,
  HeartHandshake,
};

export function CourseCategoryCarousel() {
  const { currentLang, dict, toLocale, localizeHref } = useLanguage();
  const { categories, courses } = useData();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const allCourses = Object.values(courses);

  const handleScroll = (direction: 'next' | 'prev') => {
    triggerTactileHaptic('tick');
    if (!scrollContainerRef.current) return;
    const isRtl = currentLang === 'fa' || currentLang === 'ar';
    const scrollAmount = 300;
    const multiplier = direction === 'next' ? (isRtl ? -1 : 1) : (isRtl ? 1 : -1);

    scrollContainerRef.current.scrollBy({
      left: scrollAmount * multiplier,
      behavior: 'smooth',
    });
  };

  const getCourseCountForCategory = (catName: string, catSlug: string) => {
    return allCourses.filter(
      (c) =>
        c.subject === catName ||
        c.subject?.toLowerCase().includes(catSlug.toLowerCase()) ||
        c.subjectCategory === catName
    ).length;
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-4 select-none">
      {/* Header Row: Title, Subtitle & Prev/Next Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
            <span className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43] font-mono">
              DISCIPLINARY TAXONOMY
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {dict.ui_academic_branches_of_rational_sciences}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            {dict.ui_explore_courses_categorized_across_eig}
          </p>
        </div>

        {/* Desktop Carousel Controls & View All Link */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={localizeHref('/courses')}
            className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43] hover:underline flex items-center gap-1 group/all py-1.5 px-3 rounded-lg hover:bg-[#8A532B]/10 transition-colors"
          >
            <span>{dict.courses_view_all}</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 rtl:group-hover/all:-translate-x-1 ltr:group-hover/all:translate-x-1 transition-transform" />
          </Link>

          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll('prev')}
              aria-label="Previous Category"
              className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141518] text-zinc-700 dark:text-zinc-300 hover:border-[#8A532B]/50 hover:text-[#8A532B] dark:hover:text-[#C58B43] flex items-center justify-center transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 active:scale-90 cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4 rtl:block ltr:hidden" />
              <ChevronLeft className="w-4 h-4 rtl:hidden ltr:block" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('next')}
              aria-label="Next Category"
              className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141518] text-zinc-700 dark:text-zinc-300 hover:border-[#8A532B]/50 hover:text-[#8A532B] dark:hover:text-[#C58B43] flex items-center justify-center transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 active:scale-90 cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4 rtl:block ltr:hidden" />
              <ChevronRight className="w-4 h-4 rtl:hidden ltr:block" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => {
          const loc = getLocalizedCategory(cat, currentLang);
          const name = loc?.name || cat.name_fa || cat.name;
          const description = loc?.description || cat.description_fa || cat.description;
          const IconComponent = CATEGORY_ICONS[cat.iconName] || Compass;
          const count = getCourseCountForCategory(cat.name, cat.slug);

          return (
            <Link
              key={cat.id}
              href={localizeHref(`/courses?subject=${encodeURIComponent(cat.name)}`)}
              className="snap-start shrink-0 w-[240px] sm:w-[260px] rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white dark:bg-[#141518] p-4 sm:p-5 flex flex-col justify-between hover:border-[#8A532B]/60 dark:hover:border-[#C58B43]/60 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group cursor-pointer"
            >
              {/* Card Header: Icon & Course Count Pill */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#8A532B]/10 dark:bg-[#C58B43]/10 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center border border-[#8A532B]/20 dark:border-[#C58B43]/20 group-hover:bg-[#8A532B] group-hover:text-white dark:group-hover:bg-[#C58B43] dark:group-hover:text-[#0C0D0E] transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-300">
                  <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
                </div>

                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold font-num bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 group-hover:border-[#8A532B]/30 transition-colors">
                  {toLocale(count > 0 ? count : 4)}{' '}
                  {dict.ui_courses}
                </span>
              </div>

              {/* Card Body: Title & Excerpt */}
              <div className="space-y-1.5 flex-1">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition-colors leading-snug">
                  {name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Card Footer: Micro-Link Arrow */}
              <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-bold text-zinc-500 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition-colors">
                <span>
                  {dict.ui_explore_branch}
                </span>
                <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
