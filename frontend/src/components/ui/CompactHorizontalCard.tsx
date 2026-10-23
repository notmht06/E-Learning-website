'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Clock, BookOpen, ArrowLeft, Headphones } from 'lucide-react';
import { AudioCourse, Book } from '@/lib/data';
import { getLocalizedCourse, getLocalizedBook } from '@/lib/localization';
import { useLanguage } from '@/context/LanguageContext';
import { SCHOLAR_NAME } from '@/lib/constants';

interface CompactHorizontalCardProps {
  course?: AudioCourse;
  book?: Book;
}

export function CompactHorizontalCard({ course, book }: CompactHorizontalCardProps) {
  const { currentLang, dict, toLocale } = useLanguage();

  if (course) {
    const loc = getLocalizedCourse(course, currentLang);
    const title = loc?.title || course.title_fa;
    const duration = loc?.duration || course.duration_fa;
    const sessions = course.chapters?.length || course.episodes_count || 12;
    const price = loc?.price || course.price_fa || (currentLang === 'en' ? 'Free' : 'رایگان');
    const rating = 4.9;

    const sessionsSuffix =
      currentLang === 'en'
        ? (dict.catalog_sessions_suffix || 'Sessions')
        : currentLang === 'ar'
        ? (dict.catalog_sessions_suffix || 'جلسة')
        : (dict.catalog_sessions_suffix || 'جلسه');

    const viewText = currentLang === 'en' ? 'View' : currentLang === 'ar' ? 'مشاهدة' : 'مشاهده';

    return (
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50/80 dark:hover:bg-[#18191D] transition group">
        
        {/* 16:9 Thumbnail Preview */}
        <div className="relative w-32 sm:w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <img
            src={course.thumbnail || '/images/ostad_zanjirzan.jpg'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <span className="absolute bottom-1.5 end-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-num bg-[#0C0D0E]/90 text-[#FAF8F5] border border-[#8A532B]/40 backdrop-blur-xs">
            {price}
          </span>
        </div>

        {/* Content Stack */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43]">
              {loc?.subject || course.subject}
            </span>
            <div className="flex items-center gap-1 text-xs text-[#8A532B] dark:text-[#C58B43] font-bold font-num">
              <Star className="w-3 h-3 fill-current" />
              <span>{toLocale(rating)}</span>
            </div>
          </div>

          <Link href={`/courses/${course.id}`} className="block">
            <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition truncate">
              {title}
            </h4>
          </Link>

          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-num">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              {duration}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-zinc-400" />
              {toLocale(sessions)} {sessionsSuffix}
            </span>
          </div>
        </div>

        {/* Instructor Snippet & Action */}
        <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
          <div className="hidden lg:flex items-center gap-2">
            <img
              src="/images/ostad_zanjirzan.jpg"
              alt={dict.scholar_name || SCHOLAR_NAME}
              className="w-7 h-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
            />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {dict.scholar_name || SCHOLAR_NAME}
            </span>
          </div>

          <Link
            href={`/courses/${course.id}`}
            className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-[#8A532B] hover:text-white dark:hover:bg-[#C58B43] dark:hover:text-zinc-950 transition flex items-center gap-1 cursor-pointer group/link"
          >
            <span>{viewText}</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 rtl:group-hover/link:-translate-x-1 ltr:group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    );
  }

  if (book) {
    const loc = getLocalizedBook(book, currentLang);
    const title = loc?.title || book.title_fa;
    const price = loc?.price || book.price_fa;
    const badge = loc?.badge || book.badge_fa;
    const viewText = currentLang === 'en' ? 'Details' : currentLang === 'ar' ? 'التفاصيل' : 'مشاهده رساله';

    return (
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50/80 dark:hover:bg-[#18191D] transition group">
        
        {/* Cover Preview */}
        <div className="relative w-32 sm:w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center p-2 text-center">
          {book.cover_image ? (
            <img
              src={book.cover_image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="space-y-1">
              <span className="text-[10px] text-[#8A532B] font-bold block truncate max-w-28 mx-auto">{title}</span>
              <span className="text-[9px] text-zinc-400 block font-mono">انتشارات حیات</span>
            </div>
          )}
          <span className="absolute bottom-1.5 end-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-num bg-[#0C0D0E]/90 text-[#FAF8F5] border border-[#8A532B]/40 backdrop-blur-xs">
            {price}
          </span>
        </div>

        {/* Content Stack */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43]">
              {book.subjectCategory || 'حکمت و فلسفه'}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {badge}
            </span>
          </div>

          <Link href={`/books/${book.id}`} className="block">
            <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition truncate">
              {title}
            </h4>
          </Link>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
            {loc?.desc || book.desc_fa}
          </p>
        </div>

        {/* Author Snippet & Action */}
        <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
          <div className="hidden lg:flex items-center gap-2">
            <img
              src="/images/ostad_zanjirzan.jpg"
              alt={dict.scholar_name || SCHOLAR_NAME}
              className="w-7 h-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
            />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {dict.scholar_name || SCHOLAR_NAME}
            </span>
          </div>

          <Link
            href={`/books/${book.id}`}
            className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-[#8A532B] hover:text-white dark:hover:bg-[#C58B43] dark:hover:text-zinc-950 transition flex items-center gap-1 cursor-pointer group/booklink"
          >
            <span>{viewText}</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 rtl:group-hover/booklink:-translate-x-1 ltr:group-hover/booklink:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    );
  }

  return null;
}
