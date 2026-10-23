'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, BookOpen, Bookmark, Play, Pause, Radio, Headphones } from 'lucide-react';
import { AudioCourse } from '@/lib/data';
import { getLocalizedCourse } from '@/lib/localization';
import { useLanguage } from '@/context/LanguageContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { SCHOLAR_NAME } from '@/lib/constants';
import { CourseFolderPreview } from '@/components/course/CourseFolderPreview';

interface CourseCardProps {
  course: AudioCourse;
  isPlaying?: boolean;
  onPlaySample?: () => void;
}

const SCHOLAR = SCHOLAR_NAME;

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
  const scholarName = dict.scholar_name || SCHOLAR_NAME;

  return (
    <article className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition-[border-color] duration-200 ease-out hover:border-[#8A532B]/40 dark:border-zinc-800 dark:bg-[#141518] dark:hover:border-[#C58B43]/40">
      {/* 16:9 media */}
      <div className="group/media relative aspect-video overflow-hidden rounded-xl bg-[#0C0D0E]">
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:[@media(hover:hover)]:group-hover/media:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-400">
            {isOnline ? <Radio className="h-6 w-6 text-[#C58B43]" /> : <Headphones className="h-6 w-6 text-[#C58B43]" />}
            <span className="text-xs text-zinc-300">{subject}</span>
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

        <span className="absolute bottom-2 end-2 z-10 rounded-md bg-white px-2 py-1 text-xs font-bold text-zinc-900 font-num">
          {price}
        </span>

        {onPlaySample && (
          <button
            type="button"
            onClick={onPlaySample}
            className="absolute inset-0 z-0 flex items-center justify-center bg-black/30 text-white opacity-0 transition-opacity duration-150 ease-out focus-visible:opacity-100 [@media(hover:hover)]:group-hover/media:opacity-100"
            aria-label={isPlaying ? 'توقف پخش نمونه' : 'پخش نمونه صوت'}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-900 transition-transform duration-150 ease-out active:scale-95">
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

      {/* Instructor row */}
      <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <div className="flex min-w-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/ostad_zanjirzan.jpg"
            alt={scholarName}
            className="h-6 w-6 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
          />
          <span className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-200">{scholarName}</span>
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
