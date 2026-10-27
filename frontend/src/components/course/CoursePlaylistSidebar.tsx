'use client';

import React from 'react';
import Link from 'next/link';
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
      className="rounded-2xl border border-zinc-200 bg-white p-4 text-start dark:border-zinc-800 dark:bg-[#141518]"
    >
      <header className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          <Headphones className="h-4 w-4 text-[#8A532B] dark:text-[#C58B43]" />
          <span>{dict.learn_playlist_title || 'سرفصل جلسات درس‌گفتار'}</span>
        </h3>
        <span className="font-num text-xs text-zinc-500 dark:text-zinc-400">
          {toLocale(doneCount)}/{toLocale(chapters.length)}
        </span>
      </header>

      <ol className="max-h-[560px] overflow-y-auto">
        {chapters.map((ch, idx) => {
          const isActive = ch.id === activeChapterId;
          const isCompleted = completedChapterIds.includes(ch.id);
          const isLast = idx === chapters.length - 1;
          const isPreview = !!ch.isFreePreview || idx === 0;
          const isLocked = !isEnrolled && !isPreview;

          const title = getLocalizedChapterTitle(ch, currentLang);

          return (
            <li key={ch.id} className="relative">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute start-[19px] top-7 bottom-[-4px] w-px ${
                    isCompleted ? 'bg-[#8A532B]/50 dark:bg-[#C58B43]/50' : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              )}

              <button
                type="button"
                onClick={() => {
                  if (isLocked) {
                    const lockAlert = currentLang === 'en'
                      ? 'This session requires enrollment in the course.'
                      : currentLang === 'ar'
                      ? 'هذه الجلسة تتطلب التسجيل في الدورة.'
                      : 'این جلسه نیازمند ثبت‌نام در دوره است.';
                    alert(lockAlert);
                  } else {
                    onSelectChapter(idx);
                  }
                }}
                aria-current={isActive ? 'step' : undefined}
                className={`relative flex w-full cursor-pointer items-start gap-3 rounded-xl p-2 text-start transition-colors duration-150 ease-out active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A532B] ${
                  isActive
                    ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/10'
                    : isLocked
                    ? 'opacity-70 [@media(hover:hover)]:hover:bg-zinc-50/50 dark:[@media(hover:hover)]:hover:bg-zinc-900/30'
                    : '[@media(hover:hover)]:hover:bg-zinc-50 dark:[@media(hover:hover)]:hover:bg-zinc-900/60'
                }`}
              >
                <span className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                  {isLocked ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                      <Lock className="h-3 w-3" />
                    </span>
                  ) : isCompleted ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8A532B] text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  ) : isActive ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#8A532B] bg-white dark:border-[#C58B43] dark:bg-[#141518]">
                      <span className="h-2 w-2 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
                    </span>
                  ) : (
                    <span className="h-5 w-5 rounded-full border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-[#141518]" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-xs ${
                      isActive || isCompleted
                        ? 'font-bold text-zinc-900 dark:text-zinc-100'
                        : isLocked
                        ? 'text-zinc-400 dark:text-zinc-500'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <span className="font-num text-zinc-400 dark:text-zinc-500">{toLocale(idx + 1)}. </span>
                    {title}
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="font-num">{toLocale(ch.duration)}</span>
                    {isLocked ? (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {currentLang === 'en'
                          ? 'Enrollment Required'
                          : currentLang === 'ar'
                          ? 'يتطلب التسجيل'
                          : 'نیازمند ثبت‌نام در دوره'}
                      </span>
                    ) : isPreview ? (
                      <span className="rounded bg-[#8A532B]/10 px-2 py-0.5 font-bold text-[#8A532B] dark:text-[#C58B43]">
                        {dict.learn_free_preview || 'نمونه رایگان'}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
