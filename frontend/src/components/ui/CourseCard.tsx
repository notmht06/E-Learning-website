'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Play,
  Pause,
  Radio,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { AudioCourse } from '@/lib/data';
import { getLocalizedCourse } from '@/lib/localization';
import { useLanguage } from '@/context/LanguageContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { usePlayer } from '@/context/PlayerContext';
import { triggerTactileHaptic } from '@/lib/haptics';
import { Button } from '@/components/ui';

export interface CourseCardProps {
  course: AudioCourse;
  isPlaying?: boolean;
  onPlaySample?: () => void;
  index?: number;
}

function getDisciplineBanner(subject: string = '', dict: Record<string, string>) {
  const s = subject.trim().toLowerCase();
  if (s.includes('منطق') || s.includes('logic')) {
    return {
      gradient: 'bg-gradient-to-br from-[#1E2D4A] via-[#152035] to-[#0D1422]',
      accent: '#7EB0EA',
      label: dict.discipline_mantiq,
    };
  }
  if (s.includes('کلام') || s.includes('theology')) {
    return {
      gradient: 'bg-gradient-to-br from-[#163326] via-[#0F231A] to-[#08140E]',
      accent: '#5EEAD4',
      label: dict.discipline_kalam,
    };
  }
  if (s.includes('عرفان') || s.includes('mysticism')) {
    return {
      gradient: 'bg-gradient-to-br from-[#3B1824] via-[#281018] to-[#14080C]',
      accent: '#F472B6',
      label: dict.discipline_irfan,
    };
  }
  if (s.includes('اصول') || s.includes('فقه') || s.includes('jurisprudence')) {
    return {
      gradient: 'bg-gradient-to-br from-[#382818] via-[#251A10] to-[#150F09]',
      accent: '#E0A96D',
      label: dict.discipline_usul,
    };
  }
  if (s.includes('تفسیر') || s.includes('tafsir') || s.includes('quran')) {
    return {
      gradient: 'bg-gradient-to-br from-[#143038] via-[#0D2026] to-[#071317]',
      accent: '#2DD4BF',
      label: dict.discipline_exegesis,
    };
  }
  return {
    gradient: 'bg-gradient-to-br from-[#3D2314] via-[#2A180E] to-[#170C06]',
    accent: '#C58B43',
    label: dict.discipline_hikmat,
  };
}

export function CourseCard({
  course,
  isPlaying: externalIsPlaying,
  onPlaySample,
  index = 0,
}: CourseCardProps) {
  const { currentLang, dict, toLocale, localizeHref } = useLanguage();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { playTrack, togglePlay, currentCourse, isPlaying: playerIsPlaying } = usePlayer();

  const bookmarked = isBookmarked(course.id);
  const loc = getLocalizedCourse(course, currentLang);
  const title = loc?.title || course.title_fa;
  const isOnline = course.course_type === 'online';
  const price = loc?.price || course.price_fa || dict.ui_free_endowment;

  const isThisCoursePlaying =
    externalIsPlaying !== undefined
      ? externalIsPlaying
      : currentCourse?.id === course.id && playerIsPlaying;

  const isFree =
    price.toLowerCase().includes('رایگان') ||
    price.toLowerCase().includes('free') ||
    price.toLowerCase().includes('مجاني') ||
    price.toLowerCase().includes('وقف');

  const discipline = getDisciplineBanner(course.subject, dict);

  const modeLabel = isOnline
    ? dict.skyroom_badge
    : dict.courses_offline_badge;

  const bookmarkLabel = bookmarked
    ? dict.catalog_bookmark_remove
    : dict.catalog_bookmark_add;

  const enterButtonText =
    currentLang === 'en'
      ? 'Enter Course'
      : currentLang === 'ar'
      ? 'الدخول إلى قاعة الدرس'
      : dict.catalog_enter_course;

  const handleAuditionToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerTactileHaptic('thump');
    if (onPlaySample) {
      onPlaySample();
    } else if (currentCourse?.id === course.id) {
      togglePlay();
    } else {
      playTrack(course, 0);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerTactileHaptic('ribbon');
    toggleBookmark(course.id);
  };

  return (
    <article
      className={`group h-full flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white dark:border-zinc-800/80 dark:bg-[#141518] overflow-hidden transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 hover:border-[#8A532B]/60 dark:hover:border-[#C58B43]/60 cursor-pointer ${
        isThisCoursePlaying
          ? 'border-[#8A532B] dark:border-[#C58B43] ring-1 ring-[#8A532B]/30 dark:ring-[#C58B43]/30 shadow-md'
          : ''
      }`}
    >
      {/* 16:9 Media Banner */}
      <div className="group/media relative aspect-video w-full overflow-hidden bg-[#0C0D0E] select-none shrink-0">
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-500 ease-out motion-safe:[@media(hover:hover)]:group-hover:brightness-105"
          />
        ) : (
          <div
            className={`relative h-full w-full ${discipline.gradient} flex flex-col justify-between p-3 select-none transition-transform duration-500 ease-out`}
          >
            {/* Classical Manuscript Filigree Borders */}
            <div className="absolute inset-1.5 rounded-lg border border-white/10 pointer-events-none" />
            <div className="absolute inset-2 rounded-md border border-dashed border-white/5 pointer-events-none" />

            {/* Header: Imprint & Discipline Badge */}
            <div className="relative z-1 flex items-center justify-between text-[11px] font-mono text-white/70 h-5">
              <span className="font-bold text-amber-200/80 text-[11px]">
                DAR AL-HIKMAH
              </span>
              <span className="px-1.5 py-0.5 rounded border border-white/15 bg-black/40 backdrop-blur-xs text-stone-200 text-[11px] font-medium font-sans truncate max-w-[130px]">
                {discipline.label}
              </span>
            </div>

            {/* Center Calligraphic Title */}
            <div className="relative z-1 my-auto text-center px-2 space-y-1">
              <span className="block text-xs sm:text-[13px] font-bold text-white/95 line-clamp-2 leading-relaxed font-sans">
                {title}
              </span>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-200/70 font-mono">
                <span>•</span>
                <span>{dict.ui_official_lecture}</span>
                <span>•</span>
              </div>
            </div>

            <div className="h-1" />
          </div>
        )}

        {/* Top-Start: Course Status Capsule (Online / Offline) */}
        <div className="absolute top-2.5 start-2.5 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/60 backdrop-blur-md text-stone-100 border border-white/15 shadow-xs">
            <Radio className={`w-2.5 h-2.5 ${isOnline ? 'text-amber-400' : 'text-stone-300'}`} />
            <span>{modeLabel}</span>
          </span>
        </div>

        {/* Top-End: Bookmark Icon Button */}
        <button
          type="button"
          onClick={handleBookmarkClick}
          className="absolute top-2.5 end-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white backdrop-blur-md border border-white/15 transition-transform duration-150 active:scale-90 [@media(hover:hover)]:hover:bg-black/80"
          title={bookmarkLabel}
          aria-label={bookmarkLabel}
          aria-pressed={bookmarked}
        >
          <Bookmark
            className={`h-3.5 w-3.5 ${
              bookmarked ? 'fill-[#C58B43] text-[#C58B43]' : 'text-white/90'
            }`}
          />
        </button>

        {/* Center Audition Audio Button */}
        <button
          type="button"
          onClick={handleAuditionToggle}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/35 opacity-0 transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-300 ease-out focus-visible:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
          aria-label={isThisCoursePlaying ? 'توقف پخش نمونه' : 'پخش نمونه صوت'}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#8A532B] dark:bg-[#141518]/95 dark:text-[#C58B43] dark:border dark:border-[#C58B43]/50 transition-transform duration-200 active:scale-95 shadow-xl">
            {isThisCoursePlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ps-0.5" />
            )}
          </span>
        </button>
      </div>

      {/* Body Content Stack */}
      <div className="flex flex-col flex-1 p-3.5 pt-3 justify-between space-y-3">
        {/* Course Title */}
        <div className="min-h-[44px] flex items-start overflow-hidden">
          <Link href={localizeHref(`/courses/${course.id}`)} className="group/title block w-full">
            <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover/title:text-[#8A532B] dark:group-hover/title:text-[#C58B43] transition-colors">
              {title}
            </h3>
          </Link>
        </div>

        {/* Scholar Instructor Row (without Star Rating) */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/ostad_zanjirzan.jpg"
            alt={dict.scholar_full_title}
            className="h-5 w-5 rounded-full object-cover ring-1 ring-[#8A532B]/30 shrink-0"
          />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
            {dict.scholar_full_title}
          </span>
        </div>
      </div>

      {/* Card Footer: Pricing & Entrance Button */}
      <div className="border-t border-zinc-100 p-3.5 py-2.5 dark:border-zinc-800/80 flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          {isFree ? (
            <div>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 line-through block font-mono leading-tight tabular-nums">
                {currentLang === 'en'
                  ? '$45.00'
                  : currentLang === 'ar'
                  ? '٤٥٠,٠٠٠ تومان'
                  : `${toLocale('۴۵۰,۰۰۰')} تومان`}
              </span>
              <span className="text-sm font-bold text-[#8A532B] dark:text-[#C58B43] block">
                {dict.ui_free_endowment}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 line-through block font-mono leading-tight tabular-nums">
                {currentLang === 'en' ? '$65.00' : `${toLocale('۶۵۰,۰۰۰')}`}
              </span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-num block tabular-nums">
                {price}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs font-bold hover:bg-[#8A532B] hover:text-white dark:hover:bg-[#C58B43] dark:hover:text-[#0C0D0E] transition-[color,background-color,border-color,opacity,transform,box-shadow] group/btn"
          >
            <Link href={localizeHref(`/courses/${course.id}`)}>
              <span>{enterButtonText}</span>
              {currentLang === 'en' ? (
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              ) : (
                <ArrowLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-1 transition-transform" />
              )}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export default CourseCard;
