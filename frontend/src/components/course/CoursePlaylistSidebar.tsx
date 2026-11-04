'use client';

import React from 'react';
import { Check, Headphones, Lock } from 'lucide-react';
import { AudioChapter } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedChapterTitle } from '@/lib/localization';

export interface CoursePlaylistSidebarProps {
  courseId?: string;
  chapters: AudioChapter[];
  activeChapterId: number;
  isEnrolled?: boolean;
  onSelectChapter: (index: number) => void;
  completedChapterIds?: number[];
}

export function CoursePlaylistSidebar({
  courseId = 'course1',
  chapters,
  activeChapterId,
  isEnrolled = false,
  onSelectChapter,
  completedChapterIds = [],
}: CoursePlaylistSidebarProps) {
  const { toLocale, dict, currentLang } = useLanguage();
  const doneCount = chapters.filter((c) => completedChapterIds.includes(c.id)).length;

  return (
    <section
      aria-label={dict.learn_playlist_title || 'سرفصل جلسات'}
      className="rounded-2xl border border-zinc-200/90 bg-white p-3 sm:p-4 text-start dark:border-zinc-800/80 dark:bg-[#141518] shadow-xs select-none"
    >
      <header className="mb-3 flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800/60">
        <h3 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
          <Headphones className="h-4 w-4 text-[#8A532B] dark:text-[#C58B43]" />
          <span>{dict.learn_playlist_title || 'سرفصل جلسات درس‌گفتار'}</span>
        </h3>
        <span className="font-num text-xs font-bold text-zinc-500 dark:text-zinc-400 tabular-nums">
          {toLocale(doneCount)} / {toLocale(chapters.length)}
        </span>
      </header>

      <ul className="space-y-1 max-h-[560px] overflow-y-auto pe-0.5">
        {chapters.map((ch, idx) => {
          const isActive = ch.id === activeChapterId;
          const isCompleted = completedChapterIds.includes(ch.id);
          const isPreview = !!ch.isFreePreview || idx === 0;
          const isLocked = !isEnrolled && !isPreview;

          const rawTitle = getLocalizedChapterTitle(ch, currentLang);
          // Strip redundant "جلسه ۱: ", "جلسه نخست: " prefix if present in the data
          const cleanTitle =
            rawTitle.replace(/^جلسه\s+[\u0600-\u06FF\d]+\s*[:\-•]\s*/, '').trim() || rawTitle;

          const displayNumber = toLocale(String(idx + 1).padStart(2, '0'));

          return (
            <li key={ch.id}>
              <button
                type="button"
                onClick={() => onSelectChapter(idx)}
                aria-current={isActive ? 'step' : undefined}
                className={`group w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-start transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#E6CA85] font-bold border border-[#8A532B]/30 dark:border-[#C58B43]/40'
                    : isLocked
                    ? 'opacity-60 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-400'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {/* 1. Episode Index Number */}
                <span className="w-6 shrink-0 text-center font-num text-xs font-bold text-zinc-400 dark:text-zinc-500 tabular-nums group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                  {displayNumber}
                </span>

                {/* 2. Episode Title */}
                <span className="min-w-0 flex-1 truncate text-xs leading-normal">
                  {cleanTitle}
                </span>

                {/* 3. Duration */}
                <span className="shrink-0 font-num text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                  {toLocale(ch.duration)}
                </span>

                {/* 4. Completion Checkmark (Visible if completed, empty if not seen yet) */}
                <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                  {isCompleted ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500 shadow-xs">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  ) : isLocked ? (
                    <Lock className="h-3 w-3 text-zinc-400" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default CoursePlaylistSidebar;
