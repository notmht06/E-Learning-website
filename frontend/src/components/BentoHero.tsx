'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  BookOpen,
  Headphones,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { AudioCourse } from '@/lib/data';
import { getLocalizedCategory } from '@/lib/localization';
import { SCHOLAR_NAME } from '@/lib/constants';

interface BentoHeroProps {
  heroCourse?: AudioCourse;
  onOpenBookReader?: (bookId: string) => void;
}

export function BentoHero({}: BentoHeroProps) {
  const { currentLang, dict } = useLanguage();
  const { categories } = useData();

  const heroBadge = dict.hero_badge || 'پایگاه رسمی دروس و معارف';
  const scholarTitle = dict.scholar_name || SCHOLAR_NAME;
  const subtitle = dict.hero_subtitle || 'درس‌گفتارها، تقریرات و پژوهش‌های علوم عقلی و نقلی';
  const coursesBtn = dict.btn_listen_courses || dict.nav_courses || 'مشاهده دوره‌ها';
  const roadmapBtn = dict.nav_roadmap || 'سیر مطالعاتی';
  const booksBtn = dict.nav_books || 'کتب و آثار';

  return (
    <section id="hero" className="max-w-4xl mx-auto px-4 sm:px-6 w-full pt-8 sm:pt-8 pb-4 text-center space-y-5">
      {/* Top Status Pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#8A532B]/10 text-[#8A532B] border border-[#8A532B]/20 mx-auto">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B]" />
        <span>{heroBadge}</span>
      </div>

      {/* Main Scholar Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
          {scholarTitle}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium">
          {subtitle}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a
          href="#catalog"
          className="px-6 py-3 rounded-full bg-[#8A532B] hover:bg-[#724424] text-white text-xs sm:text-sm font-medium shadow-xs transition duration-200 flex items-center gap-2 cursor-pointer"
        >
          <Headphones className="w-4 h-4" />
          <span>{coursesBtn}</span>
        </a>
        <Link
          href="/roadmap"
          className="px-5 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-medium transition duration-200 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Compass className="w-4 h-4 text-[#8A532B]" />
          <span>{roadmapBtn}</span>
        </Link>
        <Link
          href="/books"
          className="px-5 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-medium transition duration-200 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <BookOpen className="w-4 h-4 text-[#8A532B]" />
          <span>{booksBtn}</span>
        </Link>
      </div>

      {/* Subject Quick Links */}
      <div className="pt-3 flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
        {categories.slice(0, 6).map((cat) => {
          const locCat = getLocalizedCategory(cat, currentLang);
          return (
            <Link
              key={cat.id}
              href={`/courses?subject=${encodeURIComponent(cat.name)}`}
              className="px-3 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800/80 hover:bg-[#8A532B]/10 hover:text-[#8A532B] text-zinc-600 dark:text-zinc-300 transition duration-150 border border-transparent hover:border-[#8A532B]/20"
            >
              {locCat?.name || cat.name}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
