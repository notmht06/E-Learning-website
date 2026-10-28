'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AudioCourse, CourseCategory, Book, booksDatabase } from '@/lib/data';
import {
  MasterpieceCourseCard,
  MasterpieceBookCard,
} from '@/components/catalog';
import { triggerTactileHaptic } from '@/lib/haptics';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  Button,
  Badge,
} from '@/components/ui';

interface CourseCatalogBentoProps {
  courses: AudioCourse[];
  categories: CourseCategory[];
  onOpenBookReader?: (bookId: string) => void;
  onAddToCart?: (book: Book) => void;
}

export function CourseCatalogBento({
  courses,
  onOpenBookReader,
  onAddToCart,
}: CourseCatalogBentoProps) {
  const { dict, toLocale } = useLanguage();
  const [filterType, setFilterType] = useState<string>('all');

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

  return (
    <section id="catalog" className="max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-12 text-start">
      {/* ۱. بخش آرشیو درس‌گفتارها با shadcn Tabs */}
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

          {/* استاندارد shadcn TabsList */}
          <Tabs value={filterType} onValueChange={(val) => {
            triggerTactileHaptic('tick');
            setFilterType(val);
          }}>
            <TabsList>
              <TabsTrigger value="all" className="gap-1.5 text-xs">
                <span>{dict.catalog_type_all || 'همه دوره‌ها'}</span>
                <span className="text-[10px] opacity-70">({toLocale(courses.length)})</span>
              </TabsTrigger>
              <TabsTrigger value="offline" className="gap-1.5 text-xs">
                <span>{dict.catalog_type_offline || 'دوره‌های آفلاین'}</span>
                <span className="text-[10px] opacity-70">({toLocale(offlineCount)})</span>
              </TabsTrigger>
              <TabsTrigger value="online" className="gap-1.5 text-xs">
                <span>{dict.catalog_type_online || 'دوره‌های آنلاین'}</span>
                <span className="text-[10px] opacity-70">({toLocale(onlineCount)})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* شبکه ۳ ستونی کارت‌های استاندارد shadcn */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course, idx) => (
            <MasterpieceCourseCard key={course.id} course={course} index={idx} />
          ))}
        </div>

        {/* نوار دسترسی به کل آرشیو با دکمه shadcn Button */}
        <div className="pt-2 flex justify-center">
          <Button asChild variant="outline" size="default" className="font-bold text-xs gap-2">
            <Link href="/courses">
              <span>
                {dict.courses_view_all || 'مشاهده کل آرشیو دروس'} ({toLocale(courses.length)}{' '}
                {dict.courses_count_suffix || 'دوره کامل'})
              </span>
              <ArrowLeft className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43] rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </Button>
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

          <Button asChild variant="link" size="sm" className="font-bold text-xs p-0 gap-1 self-start sm:self-auto">
            <Link href="/books">
              <span>{dict.books_view_all || 'مشاهده تالار کتب و رسالات'}</span>
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
