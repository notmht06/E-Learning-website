'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, BookOpen, Bookmark, Play, Pause } from 'lucide-react';
import { AudioCourse } from '@/lib/data';
import { getLocalizedCourse } from '@/lib/localization';
import { useLanguage } from '@/context/LanguageContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { CourseFolderPreview } from '@/components/course/CourseFolderPreview';

interface CourseCardProps {
  course: AudioCourse;
  isPlaying?: boolean;
  onPlaySample?: () => void;
}

function getDisciplineBanner(subject: string = '', lang: string = 'fa') {
  const s = subject.trim().toLowerCase();
  if (s.includes('منطق') || s.includes('logic')) {
    return {
      gradient: 'bg-gradient-to-br from-[#1E2D4A] via-[#152035] to-[#0D1422]',
      accent: '#7EB0EA',
      label: lang === 'en' ? 'Logic & Epistemology' : lang === 'ar' ? 'المنطق والمناهج' : 'منطق و روش‌شناسی',
    };
  }
  if (s.includes('کلام') || s.includes('theology')) {
    return {
      gradient: 'bg-gradient-to-br from-[#163326] via-[#0F231A] to-[#08140E]',
      accent: '#5EEAD4',
      label: lang === 'en' ? 'Rational Theology' : lang === 'ar' ? 'علم الكلام والعقائد' : 'کلام و عقاید عقلی',
    };
  }
  if (s.includes('عرفان') || s.includes('mysticism')) {
    return {
      gradient: 'bg-gradient-to-br from-[#3B1824] via-[#281018] to-[#14080C]',
      accent: '#F472B6',
      label: lang === 'en' ? 'Theoretical Mysticism' : lang === 'ar' ? 'العرفان النظري' : 'عرفان نظری و سلوک',
    };
  }
  if (s.includes('اصول') || s.includes('فقه') || s.includes('jurisprudence')) {
    return {
      gradient: 'bg-gradient-to-br from-[#382818] via-[#251A10] to-[#150F09]',
      accent: '#E0A96D',
      label: lang === 'en' ? 'Principles of Jurisprudence' : lang === 'ar' ? 'أصول الفقه والاجتهاد' : 'اصول فقه و اجتهاد',
    };
  }
  return {
    gradient: 'bg-gradient-to-br from-[#3D2314] via-[#2A180E] to-[#170C06]',
    accent: '#C58B43',
    label: lang === 'en' ? 'Transcendent Philosophy' : lang === 'ar' ? 'الحكمة المتعالية والفلسفة' : 'فلسفه و حکمت متعالیه',
  };
}

export function CourseCard({ course, isPlaying = false, onPlaySample }: CourseCardProps) {
  const { currentLang, dict, toLocale } = useLanguage();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(course.id);

  const loc = getLocalizedCourse(course, currentLang);
  const title = loc?.title || course.title_fa;
  const subject = loc?.subject || course.subject;
  const isOnline = course.course_type === 'online';
  const totalSessions = course.chapters?.length || course.episodes_count;
  const duration = loc?.duration || course.duration_fa;
  const price = loc?.price || course.price_fa || (currentLang === 'en' ? 'Free' : currentLang === 'ar' ? 'مجاني' : 'رایگان');
  const level = loc?.level || course.level_fa || (currentLang === 'en' ? 'Advanced Seminary Level' : 'سطح عالی و خارج');

  const sessionsSuffix =
    currentLang === 'en'
      ? dict.catalog_sessions_suffix || 'Sessions'
      : currentLang === 'ar'
      ? dict.catalog_sessions_suffix || 'جلسة'
      : dict.catalog_sessions_suffix || 'جلسه';

  const modeLabel = isOnline
    ? dict.skyroom_badge || (currentLang === 'en' ? 'Online Course' : currentLang === 'ar' ? 'دورة عبر الإنترنت' : 'دوره آنلاین')
    : dict.courses_offline_badge || (currentLang === 'en' ? 'Offline Course' : currentLang === 'ar' ? 'دورة غير متصلة' : 'دوره آفلاین');

  const bookmarkLabel = bookmarked
    ? dict.catalog_bookmark_remove || 'حذف نشانک'
    : dict.catalog_bookmark_add || 'افزودن نشانک';

  const viewText = dict.catalog_featured_action || (currentLang === 'en' ? 'View course' : currentLang === 'ar' ? 'عرض الدورة' : 'مشاهده دوره');
  const discipline = getDisciplineBanner(course.subject, currentLang);

  return (
    <article className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition-[border-color] duration-200 ease-out hover:border-[#8A532B]/40 dark:border-zinc-800 dark:bg-[#141518] dark:hover:border-[#C58B43]/40">
      {/* 16:9 Classical Manuscript Media */}
      <div className="group/media relative aspect-video overflow-hidden rounded-xl bg-[#0C0D0E]">
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover/media:scale-[1.03]"
          />
        ) : (
          <div className={`relative h-full w-full ${discipline.gradient} flex flex-col justify-between p-3.5 select-none transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover/media:scale-[1.02]`}>
            {/* Manuscript Inset Borders */}
            <div className="absolute inset-2 rounded-lg border border-white/10 pointer-events-none" />
            <div className="absolute inset-2.5 rounded-md border border-dashed border-white/5 pointer-events-none" />

            {/* Header: Imprint & Discipline Badge */}
            <div className="relative z-1 flex items-center justify-between text-[10px] tracking-wider font-mono text-white/70">
              <span className="font-bold uppercase tracking-widest text-amber-200/80">DAR AL-HIKMAH</span>
              <span className="px-2 py-0.5 rounded border border-white/15 bg-black/40 backdrop-blur-xs text-stone-200 text-[10px] font-medium font-sans">
                {discipline.label}
              </span>
            </div>

            {/* Center Calligraphic Title */}
            <div className="relative z-1 my-auto text-center px-4 space-y-1">
              <span className="block text-xs sm:text-sm font-bold text-white/95 line-clamp-2 leading-relaxed">
                {title}
              </span>
              <div className="flex items-center justify-center gap-1.5 text-[9px] text-amber-200/70 font-mono">
                <span>✦</span>
                <span className="tracking-widest">درس‌گفتار رسمی</span>
                <span>✦</span>
              </div>
            </div>

            {/* Bottom spacer for clean layout */}
            <div className="h-4" />
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(course.id);
          }}
          className="absolute start-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur-sm transition-transform duration-150 ease-out active:scale-95 [@media(hover:hover)]:hover:bg-black/70"
          title={bookmarkLabel}
          aria-label={bookmarkLabel}
          aria-pressed={bookmarked}
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current text-[#C58B43]' : ''}`} />
        </button>

        <span className="absolute bottom-2 end-2 z-10 rounded-md bg-[#0C0D0E]/90 dark:bg-[#1E2024]/95 text-[#FAF8F5] px-2 py-1 text-xs font-bold border border-[#8A532B]/40 dark:border-[#C58B43]/40 font-num backdrop-blur-xs">
          {price}
        </span>

        {onPlaySample && (
          <button
            type="button"
            onClick={onPlaySample}
            className="absolute inset-0 z-0 flex items-center justify-center bg-black/30 text-white opacity-0 transition-opacity duration-150 ease-out focus-visible:opacity-100 [@media(hover:hover)]:group-hover/media:opacity-100"
            aria-label={isPlaying ? 'توقف پخش نمونه' : 'پخش نمونه صوت'}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-900 dark:bg-[#1E2024]/95 dark:text-[#FAF8F5] dark:border dark:border-[#C58B43]/50 transition-transform duration-150 ease-out active:scale-95 shadow-md">
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ps-0.5" />}
            </span>
          </button>
        )}
      </div>

      {/* Category + mode */}
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-md bg-[#8A532B]/10 px-2 py-1 font-bold text-[#8A532B] dark:text-[#C58B43]">{subject}</span>
        <span className="text-zinc-500 dark:text-zinc-400">{modeLabel}</span>
      </div>

      {/* Title */}
      <Link href={`/courses/${course.id}`} className="block">
        <h3 className="line-clamp-2 min-h-10 text-base font-bold leading-snug text-zinc-900 transition-colors duration-150 ease-out dark:text-zinc-100 [@media(hover:hover)]:group-hover:text-[#8A532B] dark:[@media(hover:hover)]:group-hover:text-[#C58B43]">
          {title}
        </h3>
      </Link>

      {/* Real meta only: duration + lesson count */}
      <div className="flex items-center gap-4 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 font-num">
        {duration && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#8A532B] dark:text-[#C58B43]" />
            {duration}
          </span>
        )}
        {totalSessions > 0 && (
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-[#8A532B] dark:text-[#C58B43]" />
            {toLocale(totalSessions)} {sessionsSuffix}
          </span>
        )}
      </div>

      {/* Level & Action row */}
      <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8A532B] dark:bg-[#C58B43] shrink-0" />
          <span className="truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">
            {level}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <CourseFolderPreview course={course} />
          <Link
            href={`/courses/${course.id}`}
            className="shrink-0 text-xs font-bold text-[#8A532B] transition-transform duration-150 ease-out active:scale-[0.97] dark:text-[#C58B43] [@media(hover:hover)]:hover:underline"
          >
            {viewText}
          </Link>
        </div>
      </div>
    </article>
  );
}
