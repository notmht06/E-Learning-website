'use client';

import React from 'react';
import Link from 'next/link';
import {
  Disc,
  Play,
  Pause,
  Lock,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { AudioCourse, toLocaleDigits } from '@/lib/data';
import { usePlayer } from '@/context/PlayerContext';
import { useLanguage } from '@/context/LanguageContext';
import { triggerTactileHaptic } from '@/lib/haptics';

interface CourseSyllabusAccordionProps {
  course: AudioCourse;
  chapters: any[];
  locChapters?: any[];
  isEnrolled: boolean;
  className?: string;
}

export function CourseSyllabusAccordion({
  course,
  chapters,
  locChapters,
  isEnrolled,
  className = '',
}: CourseSyllabusAccordionProps) {
  const { currentLang, dict, toLocale } = useLanguage();
  const { playTrack, currentCourse, currentChapterIndex, isPlaying, togglePlay } = usePlayer();

  const t = {
    title: dict.dash_courses_sessions_ready || 'سرفصل‌ها و جلسات دوره',
    session_unit: dict.course_unit_sessions || 'جلسه',
    free_preview: dict.course_session_free || 'نمونه رایگان',
    locked: dict.course_session_locked || 'جلسه قفل است (نیازمند ثبت‌نام)',
    enter_theater: dict.course_sticky_enter_btn || 'ورود به تئاتر یادگیری',
  };

  return (
    <section aria-label="فهرست جلسات" className={`space-y-4 text-start ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8] dark:border-[#24262D]">
        <div className="flex items-center gap-2">
          <Disc className="w-5 h-5 text-[#8A532B] dark:text-[#C58B43]" />
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {t.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#18191D] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
            {toLocale(chapters.length)} {t.session_unit}
          </span>
        </div>
      </div>

      {/* Chapters / Sessions List */}
      <div className="space-y-2.5">
        {chapters.map((ch, idx) => {
          const isCurrent =
            currentCourse?.id === course.id && currentChapterIndex === idx && isPlaying;
          const chTitle = locChapters?.[idx]?.title || ch.title_fa || ch.title || `جلسه ${idx + 1}`;
          const isSample = idx === 0 || ch.is_preview || ch.isFreePreview;
          const canPlay = isEnrolled || isSample;

          return (
            <div
              key={ch.id || idx}
              className={`p-3.5 sm:p-4 rounded-2xl border transition duration-200 flex items-center justify-between gap-4 ${
                isCurrent
                  ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/15 border-[#8A532B] dark:border-[#C58B43] shadow-xs'
                  : 'bg-white dark:bg-[#141518] border-[#E6E1D8] dark:border-[#24262D] hover:border-[#8A532B]/40 dark:hover:border-[#C58B43]/40'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Play / Lock Action Button */}
                {canPlay ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerTactileHaptic('tick');
                      if (currentCourse?.id === course.id && currentChapterIndex === idx) {
                        togglePlay();
                      } else {
                        playTrack(course, idx);
                      }
                    }}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition shadow-xs cursor-pointer ${
                      isCurrent
                        ? 'bg-[#8A532B] dark:bg-[#C58B43] text-white'
                        : 'bg-zinc-100 dark:bg-[#1E2024] hover:bg-[#8A532B] hover:text-white dark:hover:bg-[#C58B43] text-zinc-700 dark:text-zinc-300'
                    }`}
                    title={isCurrent ? 'توقف پخش' : 'پخش صوت جلسه'}
                    aria-label={`پخش صوت جلسه ${idx + 1}`}
                  >
                    {isCurrent ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current translate-x-0.5 rtl:-translate-x-0.5" />
                    )}
                  </button>
                ) : (
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-100 dark:bg-[#1E2024] border border-zinc-200 dark:border-zinc-800 text-zinc-400 flex items-center justify-center shrink-0 select-none"
                    title={t.locked}
                  >
                    <Lock className="w-4 h-4" />
                  </div>
                )}

                {/* Session Index & Title */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-400">
                      {t.session_unit} {toLocaleDigits(idx + 1, currentLang)}
                    </span>

                    {isSample && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/30 text-[10px] font-bold">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{t.free_preview}</span>
                      </span>
                    )}

                    {!canPlay && (
                      <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                        • {t.locked}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate pt-0.5">
                    {chTitle}
                  </h3>
                </div>
              </div>

              {/* Duration & Waveform Status */}
              <div className="flex items-center gap-3 shrink-0">
                {isCurrent && (
                  <div className="hidden sm:flex items-center gap-0.5 h-3">
                    <span className="w-0.5 h-3 bg-[#8A532B] dark:bg-[#C58B43] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-0.5 h-2 bg-[#8A532B] dark:bg-[#C58B43] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-0.5 h-3.5 bg-[#8A532B] dark:bg-[#C58B43] rounded-full animate-bounce" />
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{toLocaleDigits(ch.duration, currentLang)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
