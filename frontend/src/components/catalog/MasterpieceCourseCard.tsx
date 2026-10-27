'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bookmark,
  Headphones,
  Play,
  Pause,
  Radio,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import { usePlayer } from '@/context/PlayerContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { AudioCourse } from '@/lib/data';
import { getLocalizedCourse } from '@/lib/localization';
import { CourseFolderPreview } from '@/components/course/CourseFolderPreview';
import { triggerTactileHaptic } from '@/lib/haptics';

export const EDITORIAL_SPRING = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
  mass: 0.75,
};

export const TACTILE_SPRING = {
  type: 'spring' as const,
  stiffness: 520,
  damping: 28,
  mass: 0.6,
};

interface MasterpieceCourseCardProps {
  course: AudioCourse;
  index: number;
}

export function MasterpieceCourseCard({ course, index }: MasterpieceCourseCardProps) {
  const { currentLang, toLocale, dict } = useLanguage();
  const { playTrack, togglePlay, currentCourse, isPlaying } = usePlayer();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const loc = getLocalizedCourse(course, currentLang);
  const title = loc?.title || course.title_fa;
  const subject = loc?.subject || course.subject;
  const duration = loc?.duration || course.duration_fa;
  const level = loc?.level || course.level_fa || (currentLang === 'en' ? 'Advanced Seminary Level' : 'سطح عالی و خارج');
  const price =
    loc?.price ||
    course.price_fa ||
    (currentLang === 'en' ? 'Free Endowment' : currentLang === 'ar' ? 'وقف علمي مجاني' : 'رایگان (وقف عام)');

  const isOnline = course.course_type === 'online';
  const sessionsCount = course.episodes_count || course.chapters?.length || 12;
  const isThisCoursePlaying = currentCourse?.id === course.id && isPlaying;
  const bookmarked = isBookmarked(course.id);

  const firstChapter = course.chapters?.[0];
  const firstChapterTitle =
    loc?.chapters?.[0]?.title ||
    firstChapter?.title_fa ||
    (currentLang === 'en' ? 'Session 1: Introductory Outline' : currentLang === 'ar' ? 'الجلسة الأولى: مدخل البحث' : 'جلسه اول: مدخل بحث');

  const serialCode = `CRS-${String(index + 1).padStart(2, '0')}`;

  const handleAuditionToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerTactileHaptic('thump');
    if (currentCourse?.id === course.id) {
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
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -3 }}
      transition={EDITORIAL_SPRING}
      className={`group relative rounded-2xl border bg-[#FAF8F5] dark:bg-[#121316] p-5 flex flex-col justify-between transition-colors duration-200 ${
        isThisCoursePlaying
          ? 'border-[#8A532B] dark:border-[#C58B43] shadow-[0_12px_32px_-12px_rgba(138,83,43,0.22)]'
          : 'border-[#E6E1D8] dark:border-[#22242A] hover:border-[#8A532B]/50 dark:hover:border-[#C58B43]/50'
      }`}
    >
      <div className="space-y-4">
        {/* بخش بالایی: شناسنامه آرشیوی، بج رشته علمی و دکمه نشان‌گذاری */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43]">
              {subject}
            </span>
            {isOnline ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#8A532B]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20">
                <Radio className="w-3 h-3" />
                <span>{dict.skyroom_badge || 'دوره آنلاین'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <Headphones className="w-3 h-3 text-[#8A532B] dark:text-[#C58B43]" />
                <span>{dict.courses_offline_badge || 'صوت رسمی'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
              [{serialCode}]
            </span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              transition={TACTILE_SPRING}
              onClick={handleBookmarkClick}
              aria-label={bookmarked ? (dict.catalog_bookmark_remove || 'حذف نشان') : (dict.catalog_bookmark_add || 'نشان‌گذاری درس')}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                bookmarked
                  ? 'bg-[#8A532B]/15 border-[#8A532B]/40 text-[#8A532B] dark:text-[#C58B43]'
                  : 'bg-white dark:bg-[#18191D] border-[#E6E1D8] dark:border-[#262830] text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* عنوان دوره با ارتفاع استاندارد دو خطی برای حفظ تقارن شبکه‌ای */}
        <div className="space-y-1">
          <Link href={`/courses/${course.id}`} className="block focus:outline-none">
            <h3 className="text-base font-bold text-[#0C0D0E] dark:text-[#FAF8F5] group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition-colors line-clamp-2 min-h-[3.25rem] leading-snug">
              {title}
            </h3>
          </Link>
        </div>

        {/* نوار شنیدن نمونه استودیویی */}
        <div
          onClick={handleAuditionToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleAuditionToggle(e as unknown as React.MouseEvent);
          }}
          className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
            isThisCoursePlaying
              ? 'bg-[#0C0D0E] text-[#FAF8F5] border-[#8A532B]'
              : 'bg-white dark:bg-[#17181C] border-[#E6E1D8] dark:border-[#24262D] hover:border-[#8A532B]/50'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={TACTILE_SPRING}
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isThisCoursePlaying
                  ? 'bg-[#8A532B] text-[#FAF8F5]'
                  : 'bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/25'
              }`}
            >
              {isThisCoursePlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ps-0.5" />
              )}
            </motion.div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider ${
                    isThisCoursePlaying ? 'text-[#C58B43]' : 'text-[#8A532B] dark:text-[#C58B43]'
                  }`}
                >
                  {isThisCoursePlaying
                    ? dict.player_status_playing || 'در حال پخش نمونه'
                    : dict.catalog_listen_sample || 'شنیدن نمونه'}
                </span>
              </div>
              <p
                className={`text-xs font-medium truncate mt-0.5 ${
                  isThisCoursePlaying ? 'text-zinc-200' : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {firstChapterTitle}
              </p>
            </div>
          </div>

          {/* موج صوتی ۵ ستونی */}
          <div
            className="flex items-end gap-0.5 h-4 shrink-0 px-1 text-[#8A532B] dark:text-[#C58B43]"
            aria-hidden="true"
          >
            {[45, 85, 60, 100, 55].map((h, i) => (
              <span
                key={i}
                style={{ height: isThisCoursePlaying ? undefined : `${h * 0.45}%` }}
                className={`soundwave-bar ${isThisCoursePlaying ? 'is-animating' : 'opacity-40'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* بخش پایینی: متادیتای دقیق و دکمه مشاهده دوره */}
      <div className="pt-4 mt-4 border-t border-[#E6E1D8] dark:border-[#22242A] space-y-3.5">
        <div className="grid grid-cols-3 gap-2 text-center bg-white/70 dark:bg-[#16171B] rounded-xl p-2 border border-[#ECE8E0] dark:border-[#202228]">
          <div className="space-y-0.5">
            <span className="text-[10px] text-zinc-400 block">
              {dict.catalog_sessions_count || 'جلسات'}
            </span>
            <span className="text-xs font-bold font-num text-[#0C0D0E] dark:text-[#FAF8F5]">
              {toLocale(sessionsCount)} {dict.course_unit_sessions || 'جلسه'}
            </span>
          </div>
          <div className="space-y-0.5 border-x border-[#ECE8E0] dark:border-[#24262D] px-1">
            <span className="text-[10px] text-zinc-400 block">
              {dict.catalog_duration_label || 'مدت دوره'}
            </span>
            <span className="text-xs font-bold font-num text-[#0C0D0E] dark:text-[#FAF8F5] truncate block">
              {duration}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-zinc-400 block">
              {dict.course_tuition_label?.replace(':', '') || 'شهریه'}
            </span>
            <span className="text-xs font-bold font-num text-[#8A532B] dark:text-[#C58B43] truncate block">
              {price}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-tight">
            {level}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <CourseFolderPreview course={course} />
            <Link
              href={`/courses/${course.id}`}
              onClick={() => triggerTactileHaptic('tick')}
              className="px-4 py-2 rounded-xl bg-[#0C0D0E] hover:bg-[#8A532B] text-[#FAF8F5] dark:bg-[#1E2024] dark:border dark:border-[#C58B43]/30 dark:text-[#FAF8F5] dark:hover:bg-[#25282E] dark:hover:border-[#C58B43] text-xs font-bold transition-colors flex items-center gap-2 shrink-0 group/link shadow-xs"
            >
              <span>{dict.catalog_enter_course || 'مشاهده دوره'}</span>
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 rtl:group-hover/link:-translate-x-1 ltr:group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
