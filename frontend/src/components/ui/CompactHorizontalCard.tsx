'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, BookOpen, ArrowLeft, Users, Star } from 'lucide-react';
import { AudioCourse, Book } from '@/lib/data';
import { getLocalizedCourse, getLocalizedBook } from '@/lib/localization';
import { useLanguage } from '@/context/LanguageContext';

interface CompactHorizontalCardProps {
  course?: AudioCourse;
  book?: Book;
}

function getDisciplineGradient(subject: string = '') {
  const s = subject.trim().toLowerCase();
  if (s.includes('منطق') || s.includes('logic')) {
    return 'bg-gradient-to-br from-[#1E2D4A] via-[#152035] to-[#0D1422]';
  }
  if (s.includes('کلام') || s.includes('theology')) {
    return 'bg-gradient-to-br from-[#163326] via-[#0F231A] to-[#08140E]';
  }
  if (s.includes('عرفان') || s.includes('mysticism')) {
    return 'bg-gradient-to-br from-[#3B1824] via-[#281018] to-[#14080C]';
  }
  if (s.includes('اصول') || s.includes('فقه') || s.includes('jurisprudence')) {
    return 'bg-gradient-to-br from-[#382818] via-[#251A10] to-[#150F09]';
  }
  if (s.includes('تفسیر') || s.includes('tafsir') || s.includes('quran')) {
    return 'bg-gradient-to-br from-[#143038] via-[#0D2026] to-[#071317]';
  }
  return 'bg-gradient-to-br from-[#3D2314] via-[#2A180E] to-[#170C06]';
}

export function CompactHorizontalCard({ course, book }: CompactHorizontalCardProps) {
  const { currentLang, dict, toLocale } = useLanguage();

  if (course) {
    const loc = getLocalizedCourse(course, currentLang);
    const title = loc?.title || course.title_fa;
    const duration = loc?.duration || course.duration_fa;
    const sessions = course.chapters?.length || course.episodes_count || 12;
    const price = loc?.price || course.price_fa || (currentLang === 'en' ? 'Free (Endowment)' : currentLang === 'ar' ? 'وقف علمي مجاني' : 'رایگان (وقف عام)');
    const level = loc?.level || course.level_fa || (currentLang === 'en' ? 'Advanced' : 'سطح عالی');
    const gradient = getDisciplineGradient(course.subject);

    const isFree =
      price.toLowerCase().includes('رایگان') ||
      price.toLowerCase().includes('free') ||
      price.toLowerCase().includes('مجاني') ||
      price.toLowerCase().includes('وقف');

    const studentsCount =
      course.enrolledCount ||
      (Math.abs(course.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 120)) % 150) + 85;

    const sessionsSuffix =
      currentLang === 'en'
        ? (dict.catalog_sessions_suffix || 'Sessions')
        : currentLang === 'ar'
        ? (dict.catalog_sessions_suffix || 'جلسة')
        : (dict.catalog_sessions_suffix || 'جلسه');

    const viewText = currentLang === 'en' ? 'View' : currentLang === 'ar' ? 'مشاهدة' : 'مشاهده دوره';

    return (
      <div className="p-3.5 sm:p-4.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#141518] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#8A532B]/50 dark:hover:border-[#C58B43]/50 hover:shadow-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 rtl:hover:-translate-x-1 group">
        
        {/* 16:9 Thumbnail Preview */}
        <div className="relative w-full sm:w-44 aspect-video rounded-lg overflow-hidden shrink-0 bg-[#0C0D0E] border border-zinc-200/80 dark:border-zinc-800/80 select-none">
          {course.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full ${gradient} flex flex-col justify-between p-2.5 select-none relative`}>
              <div className="absolute inset-1 rounded border border-white/10 pointer-events-none" />
              <div className="text-[8px] font-mono text-amber-200/80 uppercase tracking-widest">
                DAR AL-HIKMAH
              </div>
              <span className="text-[10px] font-bold text-white/95 line-clamp-2 leading-tight">
                {title}
              </span>
              <div className="text-[8px] text-white/50 font-mono">
                ✦ {currentLang === 'en' ? 'Official Audio' : currentLang === 'ar' ? 'صوت رسمي' : 'صوت رسمی خارج'}
              </div>
            </div>
          )}
          <span className="absolute bottom-1.5 end-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-num bg-[#0C0D0E]/90 dark:bg-[#1E2024]/95 text-[#FAF8F5] border border-[#8A532B]/40 dark:border-[#C58B43]/40 backdrop-blur-xs">
            {isFree ? (currentLang === 'en' ? 'Free' : currentLang === 'ar' ? 'مجاني' : 'رایگان') : price}
          </span>
        </div>

        {/* Content Stack */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43]">
              {loc?.subject || course.subject}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {level}
            </span>
          </div>

          <Link href={`/courses/${course.id}`} className="block">
            <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition line-clamp-1">
              {title}
            </h4>
          </Link>

          {/* Scholar & Rating (Sabzlearn-style) */}
          <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 pt-0.5">
            <div className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ostad_zanjirzan.jpg"
                alt={dict.scholar_full_title || 'حجت الاسلام دکتر زنجیر زن حسینی'}
                className="w-4.5 h-4.5 rounded-full object-cover ring-1 ring-[#8A532B]/30 shrink-0"
              />
              <span className="text-[11px] font-medium truncate max-w-[180px] sm:max-w-none">
                {dict.scholar_full_title || 'حجت الاسلام دکتر زنجیر زن حسینی'}
              </span>
            </div>

            <span className="text-zinc-300 dark:text-zinc-700">•</span>

            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 font-num">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{toLocale('5.0')}</span>
            </div>
          </div>

          {/* Meta metrics */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-num pt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#8A532B] dark:text-[#C58B43]" />
              {duration}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-[#8A532B] dark:text-[#C58B43]" />
              {toLocale(sessions)} {sessionsSuffix}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-[#8A532B] dark:text-[#C58B43]" />
              {toLocale(studentsCount)} {currentLang === 'en' ? 'Scholars' : currentLang === 'ar' ? 'باحث' : 'پژوهشگر'}
            </span>
          </div>
        </div>

        {/* Action Button & Pricing */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 self-end sm:self-center border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 pt-2 sm:pt-0">
          <div className="text-start sm:text-end">
            {isFree ? (
              <div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 line-through block font-num">
                  {toLocale('۴۵۰,۰۰۰')} {dict.currency_toman || 'تومان'}
                </span>
                <span className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43]">
                  {currentLang === 'en' ? 'Free (Endowment)' : currentLang === 'ar' ? 'وقف مجاني' : 'رایگان'}
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-num">
                {price}
              </span>
            )}
          </div>

          <Link
            href={`/courses/${course.id}`}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-[#8A532B] hover:text-white dark:hover:bg-[#C58B43] dark:hover:text-zinc-950 transition flex items-center gap-1 cursor-pointer group/link"
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
      <div className="p-3.5 sm:p-4.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#141518] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#8A532B]/50 dark:hover:border-[#C58B43]/50 hover:shadow-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 rtl:hover:-translate-x-1 group">
        
        {/* Cover Preview */}
        <div className="relative w-full sm:w-44 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center p-2 text-center">
          {book.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43]">
              {book.subjectCategory || 'تألیف فلسفی'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {book.formatCategory || 'کتاب چاپی'}
            </span>
          </div>

          <Link href={`/books/${book.id}`} className="block">
            <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition line-clamp-1">
              {title}
            </h4>
          </Link>

          {/* Scholar Author */}
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/ostad_zanjirzan.jpg"
              alt={dict.scholar_full_title || 'حجت الاسلام دکتر زنجیر زن حسینی'}
              className="w-4.5 h-4.5 rounded-full object-cover ring-1 ring-[#8A532B]/30 shrink-0"
            />
            <span className="text-[11px] font-medium">
              {dict.scholar_full_title || 'حجت الاسلام دکتر زنجیر زن حسینی'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-num">
            <span>{badge}</span>
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 self-end sm:self-center border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 pt-2 sm:pt-0">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-num">
            {price}
          </span>
          <Link
            href={`/books/${book.id}`}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-[#8A532B] hover:text-white dark:hover:bg-[#C58B43] dark:hover:text-zinc-950 transition flex items-center gap-1 cursor-pointer group/link"
          >
            <span>{viewText}</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 rtl:group-hover/link:-translate-x-1 ltr:group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    );
  }

  return null;
}
