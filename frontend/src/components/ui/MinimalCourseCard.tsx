'use client';

import React from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  BookOpen,
  Radio,
  Compass,
  ChevronLeft,
  Clock,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { ShadcnBadge } from '@/components/ui/ShadcnBadge';
import { AudioCourse, toLocaleDigits, SupportedLang } from '@/lib/data';
import { getLocalizedCourse } from '@/lib/localization';
import { SCHOLAR_NAME } from '@/lib/constants';

interface MinimalCourseCardProps {
  course: AudioCourse;
  currentLang?: SupportedLang;
  dict?: any;
  isPlaying?: boolean;
  onPlaySample?: () => void;
  statusBadgeText?: string;
  sessionNumber?: number;
  progressPercent?: number;
  showProgress?: boolean;
}

export function MinimalCourseCard({
  course,
  currentLang = 'fa',
  dict = {},
  isPlaying = false,
  onPlaySample,
  statusBadgeText,
  sessionNumber,
  progressPercent,
  showProgress,
}: MinimalCourseCardProps) {
  const loc = getLocalizedCourse(course, currentLang);
  const title = loc?.title || course.title_fa;
  const isOnline = course.course_type === 'online';

  const totalSessions = course.chapters?.length || course.episodes_count || 12;
  const hasProgress = showProgress || progressPercent !== undefined;
  const currentSessionNumber = sessionNumber || (hasProgress ? 3 : 1);
  const calculatedProgress = progressPercent ?? Math.round((currentSessionNumber / totalSessions) * 100);

  const sessionDuration = course.chapters?.[0]?.duration || '۴۵:۰۰';
  const thumbnailSrc = course.thumbnail || '/images/ostad_zanjirzan.jpg';
  const price = loc?.price || course.price_fa || (currentLang === 'en' ? 'Free' : 'رایگان');

  const toLocale = (val: number | string) =>
    toLocaleDigits(val, currentLang === 'ar' ? 'ar' : currentLang === 'en' ? 'en' : 'fa');

  return (
    <div className="relative rounded-[2rem] sm:rounded-[2.25rem] border border-stone-200/90 dark:border-neutral-800 bg-[#FAF6F0] dark:bg-[#16171B] p-5 sm:p-7 transition duration-200 shadow-2xs hover:shadow-md hover:border-[#8A532B]/40 dark:hover:border-[#C58B43]/40 flex flex-col justify-between space-y-5 text-start">
      
      {/* 1. Top Badges: Category & Online/Offline & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Badge */}
          <ShadcnBadge variant="accent">
            {loc?.subject || course.subject}
          </ShadcnBadge>

          {/* Online vs Offline Badge */}
          {isOnline ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8A532B]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/30 font-num">
              <Radio className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
              <span>{dict?.catalog_type_online || (currentLang === 'en' ? 'Online Courses' : currentLang === 'ar' ? 'الدورات المباشرة' : 'دوره‌های آنلاین')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-stone-200/70 dark:bg-neutral-800 text-stone-700 dark:text-stone-300 border border-stone-300/60 dark:border-neutral-700 font-num">
              <Compass className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
              <span>{dict?.catalog_type_offline || (currentLang === 'en' ? 'Offline Courses' : currentLang === 'ar' ? 'الدورات المسجلة' : 'دوره‌های آفلاین')}</span>
            </span>
          )}
        </div>

        {/* Status Pill (As in reference screenshot) */}
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E8DECE]/70 dark:bg-neutral-800/80 text-[#7A4823] dark:text-[#E6CA85] border border-[#D9CDB8]/60 dark:border-neutral-700">
          <Sparkles className="w-3 h-3 text-[#8A532B] dark:text-[#C58B43]" />
          <span>
            {statusBadgeText || (hasProgress ? (dict?.ongoing_section_title || 'ادامه آخرین جلسه در حال مطالعه') : (isOnline ? (dict?.skyroom_status_open || 'ظرفیت فعال') : (loc?.level || course.level_fa || 'سطح تخصصی')))}
          </span>
        </span>
      </div>

      {/* 2. Middle Row: Thumbnail Image + Title + Instructor + Meta / Progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
        
        {/* Course Thumbnail Image (As instructor uploads) */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-stone-300/80 dark:border-neutral-700/80 shrink-0 bg-stone-200 dark:bg-neutral-800 shadow-2xs group/thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailSrc}
            alt={title}
            className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-200"
          />
          {onPlaySample && (
            <button
              onClick={onPlaySample}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
              title="شنیدن نمونه"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ps-0.5" />}
            </button>
          )}
        </div>

        {/* Course Details (Title, Instructor, Session Meta, Progress Bar if enrolled) */}
        <div className="flex-1 min-w-0 space-y-2 w-full">
          
          <Link href={`/courses/${course.id}`} className="group/link block">
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 group-hover/link:text-[#8A532B] dark:group-hover/link:text-[#C58B43] transition leading-snug truncate">
              {title}
            </h3>
          </Link>

          {/* Instructor Name - MUST ALWAYS be official scholar name */}
          <div className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-2">
            <span className="text-[#8A532B] dark:text-[#C58B43]">{dict?.catalog_instructor_label || 'مدرس:'}</span>
            <span className="font-bold">{dict?.scholar_name || SCHOLAR_NAME}</span>
          </div>

          {/* Session & Duration Meta */}
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-num">
            <span>{hasProgress ? `جلسه ${toLocale(currentSessionNumber)} . ${sessionDuration}` : `${toLocale(totalSessions)} ${dict?.catalog_sessions_suffix || 'جلسه'}`}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{loc?.duration || course.duration_fa}</span>
            </span>
          </div>

          {/* Progress Bar (Only when student has enrolled or active progress) */}
          {hasProgress ? (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-stone-400 font-num">
                <span>
                  پیشرفت دوره: جلسه {toLocale(currentSessionNumber)} از {toLocale(totalSessions)}
                </span>
                <span className="text-stone-800 dark:text-stone-200 font-bold">
                  {toLocale(calculatedProgress)}٪
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200/90 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#8A532B] dark:bg-[#C58B43] transition duration-200"
                  style={{ width: `${calculatedProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="pt-1 flex items-center gap-2 text-xs font-bold">
              <span className="text-stone-400">{dict?.course_tuition_label || 'شهریه:'}</span>
              <span className="text-[#8A532B] dark:text-[#C58B43] font-num font-bold">{price}</span>
            </div>
          )}

        </div>

      </div>

      {/* 3. Bottom Action Row: Clean Umber Pill Button & Audition */}
      <div className="pt-3 border-t border-stone-200/70 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Play Audition sample button */}
        {onPlaySample ? (
          <button
            onClick={onPlaySample}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer active:scale-95 ${
              isPlaying
                ? 'bg-[#8A532B] text-white'
                : 'bg-stone-200/70 dark:bg-neutral-800 text-stone-800 dark:text-stone-200 hover:bg-[#8A532B] hover:text-white'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ps-0.5" />
            )}
            <span>{isPlaying ? (dict?.dash_audio_playing || 'در حال پخش') : (dict?.catalog_sample_preview || 'شنیدن نمونه')}</span>
          </button>
        ) : (
          <div className="text-xs text-stone-500 dark:text-stone-400 font-num font-bold">
            {loc?.level || course.level_fa || 'سطح تخصصی'}
          </div>
        )}

        {/* Primary Action Button (Matching Reference Screenshot) */}
        <Link
          href={hasProgress ? `/courses/${course.id}/learn?session=${currentSessionNumber}` : `/courses/${course.id}`}
          className="px-5 py-3 sm:px-6 sm:py-3 rounded-full bg-[#8A532B] hover:bg-[#724320] dark:bg-[#9E5F2E] dark:hover:bg-[#8A532B] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer group/action"
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>{hasProgress ? (dict?.dash_resume_course || 'ورود به کلاس و ادامه درس') : (isOnline ? (dict?.skyroom_enter_btn || 'ورود به کلاس آنلاین') : (dict?.catalog_featured_action || 'مشاهده دوره'))}</span>
          <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 rtl:group-hover/action:-translate-x-1 ltr:group-hover/action:translate-x-1 transition-transform" />
        </Link>

      </div>

    </div>
  );
}
