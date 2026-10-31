'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Headphones, BookOpen } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface OngoingCourseItem {
  id: string;
  title: string;
  subject: string;
  instructor?: string;
  currentChapterTitle: string;
  completedChapters: number;
  totalChapters: number;
  progressPercent: number; // 0 to 100
  courseType?: 'offline' | 'online';
  lastPlayedAt?: string;
}

export interface OngoingCoursesTableProps {
  courses: OngoingCourseItem[];
  onContinue?: (courseId: string) => void;
  className?: string;
}

export function OngoingCoursesTable({
  courses,
  onContinue,
  className = '',
}: OngoingCoursesTableProps) {
  const { toLocale, dict, currentLang, localizeHref } = useLanguage();

  const emptyText = dict.ui_no_enrolled_courses_found_in_your_work;

  const browseText = dict.ui_explore_course_catalog;

  return (
    <div className={`space-y-3 text-start ${className}`}>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141518] shadow-xs">
        <table className="w-full text-xs text-start border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
              <th className="py-3 px-4 font-medium text-start">
                {dict.th_course_title}
              </th>
              <th className="py-3 px-4 font-medium text-start">
                {dict.th_current_lesson}
              </th>
              <th className="py-3 px-4 font-medium text-start">
                {dict.th_progress}
              </th>
              <th className="py-3 px-4 font-medium text-start hidden sm:table-cell">
                {dict.th_quality}
              </th>
              <th className="py-3 px-4 font-medium text-end">
                {dict.th_actions}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-sm">
                      {emptyText}
                    </p>
                    <Link
                      href={localizeHref('/courses')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{browseText}</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              courses.map((course) => {
                const percent = Math.min(Math.max(course.progressPercent, 0), 100);

                return (
                  <tr
                    key={course.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                          {course.title}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md font-medium bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43]">
                            {course.subject}
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            مدرس: حجت الاسلام دکتر زنجیر زن حسینی
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <Headphones className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {course.currentChapterTitle}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-num block mt-0.5">
                        {toLocale(course.completedChapters)} {dict.ongoing_session_of} {toLocale(course.totalChapters)} {dict.ongoing_session_unit}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                          <div
                            style={{ width: `${percent}%` }}
                            className="h-full bg-[#8A532B] dark:bg-[#C58B43] rounded-full transition duration-200"
                          />
                        </div>
                        <span className="font-num font-bold text-xs text-zinc-700 dark:text-zinc-300 ps-1 tabular-nums">
                          {toLocale(percent)}٪
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className="inline-block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
                        {dict.ongoing_audio_badge}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-end">
                      <Link
                        href={localizeHref(`/courses/${course.id}/learn`)}
                        onClick={() => onContinue?.(course.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current ps-0.5" />
                        <span>{dict.btn_continue_audio}</span>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
