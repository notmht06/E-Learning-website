'use client';

import React from 'react';
import { Disc, Play, Pause } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';

interface SyllabusProps {
  course: any;
  chapters: any[];
  locChapters?: any[];
  dict: Record<string, string>;
  currentLang: string;
  toLocale: (val: number | string) => string;
}

export function CourseSyllabusList({
  course, chapters, locChapters, dict, currentLang, toLocale,
}: SyllabusProps) {
  const { playTrack, currentCourse, currentChapterIndex, isPlaying, togglePlay } = usePlayer();

  return (
    <section aria-label="فهرست جلسات" className="lg:col-span-8 space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Disc className="w-5 h-5 text-[#8A532B] dark:text-[#C58B43]" />
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {dict.dash_courses_sessions_ready || 'فهرست جلسات تدریس'}
          </h2>
        </div>
        <span className="text-xs sm:text-sm text-zinc-500 font-num font-bold">
          {toLocale(chapters.length)} {dict.course_unit_sessions || 'جلسه'}
        </span>
      </div>

      <div className="space-y-3">
        {chapters.map((ch, idx) => {
          const isCurrent = currentCourse?.id === course.id && currentChapterIndex === idx && isPlaying;
          const chTitle = locChapters?.[idx]?.title || ch.title_fa || ch.title;
          const isSample = idx === 0 || ch.is_preview || ch.isFreePreview;

          return (
            <div
              key={ch.id || idx}
              className={`p-4 rounded-xl border transition duration-200 flex items-center justify-between gap-4 ${
                isCurrent
                  ? 'bg-[#8A532B]/10 border-[#8A532B] shadow-xs'
                  : 'bg-white dark:bg-[#141518] border-zinc-200 dark:border-zinc-800 hover:border-[#8A532B]/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (currentCourse?.id === course.id && currentChapterIndex === idx) togglePlay();
                    else playTrack(course, idx);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition shadow-xs cursor-pointer ${
                    isCurrent
                      ? 'bg-[#8A532B] text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-[#8A532B] hover:text-white text-zinc-700 dark:text-zinc-200'
                  }`}
                  title={dict.btn_sample_lecture_play || 'پخش صوت'}
                  aria-label="پخش صوت جلسه"
                >
                  {isCurrent ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ps-0.5" />}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400 font-num">
                      {dict.reader_page || 'جلسه'} {toLocale(idx + 1)}
                    </span>
                    {isSample && (
                      <span className="px-2 py-0.5 rounded bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] text-xs font-bold">
                        {currentLang === 'en' ? 'Free Preview' : currentLang === 'ar' ? 'معاينة مجانية' : 'نمونه رایگان'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate pt-0.5">
                    {chTitle}
                  </h3>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-num font-bold text-zinc-400 shrink-0">
                {toLocale(ch.duration)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
