'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import { AudioCourse, CourseCategory, Book, booksDatabase } from '@/lib/data';
import {
  MasterpieceCourseCard,
  MasterpieceBookCard,
  EDITORIAL_SPRING,
} from '@/components/catalog';
import { triggerTactileHaptic } from '@/lib/haptics';

interface CourseCatalogBentoProps {
  courses: AudioCourse[];
  categories: CourseCategory[];
  onOpenBookReader?: (bookId: string) => void;
  onAddToCart?: (book: Book) => void;
}

/**
 * کامپوننت اصلی کاتالوگ دوره‌ها و کتب با تب‌های فنری و چیدمان متقارن (پیراسته طبق Rule of 500)
 */
export function CourseCatalogBento({
  courses,
  onOpenBookReader,
  onAddToCart,
}: CourseCatalogBentoProps) {
  const { dict, toLocale } = useLanguage();
  const [filterType, setFilterType] = useState<'all' | 'offline' | 'online'>('all');

  const offlineCount = useMemo(
    () => courses.filter((c) => c.course_type === 'offline').length,
    [courses]
  );
  const onlineCount = useMemo(
    () => courses.filter((c) => c.course_type === 'online').length,
    [courses]
  );

  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => {
        if (filterType === 'offline') return c.course_type === 'offline';
        if (filterType === 'online') return c.course_type === 'online';
        return true;
      })
      .slice(0, 6);
  }, [courses, filterType]);

  const featuredBooks = useMemo(() => Object.values(booksDatabase).slice(0, 4), []);

  const filterTabs = [
    {
      id: 'all' as const,
      label: dict.catalog_type_all || 'همه دوره‌ها',
      count: courses.length,
    },
    {
      id: 'offline' as const,
      label: dict.catalog_type_offline || 'دوره‌های آفلاین',
      count: offlineCount,
    },
    {
      id: 'online' as const,
      label: dict.catalog_type_online || 'دوره‌های آنلاین',
      count: onlineCount,
    },
  ];

  return (
    <section id="catalog" className="max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-12 text-start">
      {/* ۱. بخش آرشیو درس‌گفتارها و کرسی‌های تدریس */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1D8] dark:border-[#22242A] pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#8A532B] dark:text-[#C58B43] uppercase tracking-wider block">
              [ ARCHIVE OF RATIONAL SCIENCES ]
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5] tracking-tight">
              {dict.courses_section_title || dict.courses_section_badge || 'دوره‌ها و درس‌گفتارهای تخصصی'}
            </h2>
          </div>

          {/* تب‌های انتخاب نوع دوره با فیزیک فنر */}
          <div
            role="tablist"
            aria-label="فیلتر نوع دوره‌ها"
            className="inline-flex p-1 bg-[#EFECE6] dark:bg-[#16171B] border border-[#E2DDD3] dark:border-[#24262D] rounded-xl text-xs font-medium self-start sm:self-auto"
          >
            {filterTabs.map((tab) => {
              const isActive = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    triggerTactileHaptic('tick');
                    setFilterType(tab.id);
                  }}
                  className={`relative px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 z-10 ${
                    isActive
                      ? 'text-[#FAF8F5] font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-[#0C0D0E] dark:hover:text-[#FAF8F5]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="catalogCourseFilterPill"
                      transition={EDITORIAL_SPRING}
                      className="absolute inset-0 rounded-lg bg-[#8A532B] shadow-xs -z-10"
                    />
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-num px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-black/20 text-[#FAF8F5]'
                        : 'bg-black/[0.05] dark:bg-white/[0.06] text-zinc-500'
                    }`}
                  >
                    {toLocale(tab.count)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* شبکه ۳ ستونی متقارن کارت‌های دوره با انیمیشن چیدمان */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, idx) => (
              <MasterpieceCourseCard key={course.id} course={course} index={idx} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* نوار دسترسی به آرشیو کامل */}
        <div className="pt-2 flex justify-center">
          <Link
            href="/courses"
            onClick={() => triggerTactileHaptic('tick')}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] hover:border-[#8A532B] text-xs font-bold text-[#0C0D0E] dark:text-[#FAF8F5] transition-colors group"
          >
            <span>
              {dict.courses_view_all || 'مشاهده کل آرشیو دروس'} ({toLocale(courses.length)}{' '}
              {dict.courses_count_suffix || 'دوره کامل'})
            </span>
            <ArrowLeft className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43] rtl:rotate-0 ltr:rotate-180 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ۲. بخش کتاب‌ها و آثار چاپی */}
      <div className="space-y-6 pt-8 border-t border-[#E6E1D8] dark:border-[#22242A]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#8A532B] dark:text-[#C58B43] uppercase tracking-wider block">
              [ HARDCOVER MONOGRAPHS • ROYAL OCTAVO ]
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5] tracking-tight">
              {dict.books_section_title || dict.nav_books || 'کتاب‌ها و آثار چاپی'}
            </h2>
          </div>

          <Link
            href="/books"
            onClick={() => triggerTactileHaptic('tick')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8A532B] dark:text-[#C58B43] hover:underline group/allbooks self-start sm:self-auto"
          >
            <span>{dict.books_view_all || 'مشاهده تالار کتب و رسالات'}</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 rtl:group-hover/allbooks:-translate-x-1 ltr:group-hover/allbooks:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <MasterpieceBookCard
              key={book.id}
              book={book}
              onOpenBookReader={onOpenBookReader}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
