'use client';

import React, { useState } from 'react';
import {
  PlayCircle,
  FileText,
  ClipboardCheck,
  PenLine,
  ChevronDown,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/lib/iranValidation';

export type LessonKind = 'video' | 'audio' | 'reading' | 'quiz' | 'assignment';

export interface OutlineLesson {
  id: string | number;
  title: string;
  kind?: LessonKind;
  minutes?: number;
  duration?: string;
  done?: boolean;
  locked?: boolean;
  preview?: boolean;
}

export interface OutlineSection {
  id: string;
  title: string;
  lessons: OutlineLesson[];
}

export interface CourseOutlineProps {
  sections: OutlineSection[];
  currentId?: string | number;
  onSelect?: (lesson: OutlineLesson) => void;
  defaultOpen?: string[];
  showSummary?: boolean;
  className?: string;
}

const kindMeta: Record<LessonKind, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  video: { icon: PlayCircle, label: 'درس ویدیویی' },
  audio: { icon: PlayCircle, label: 'صوت درس‌گفتار' },
  reading: { icon: FileText, label: 'تقریر و متن' },
  quiz: { icon: ClipboardCheck, label: 'ارزیابی مبحث' },
  assignment: { icon: PenLine, label: 'پژوهش و تمرین' },
};

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${toPersianDigits(m)} دقیقه`;
  return m ? `${toPersianDigits(h)} ساعت و ${toPersianDigits(m)} دقیقه` : `${toPersianDigits(h)} ساعت`;
}

/**
 * کامپوننت سرفصل هوشمند دوره (VibeFarsi CourseOutline)
 * بهینه‌شده برای دروس خارج و دانشگاهی با بخش‌بندی آکاردئونی، وضعیت قفل، پیش‌نمایش و تیک تکمیل
 */
export function CourseOutline({
  sections,
  currentId,
  onSelect,
  defaultOpen,
  showSummary = true,
  className,
}: CourseOutlineProps) {
  const initial =
    defaultOpen ??
    sections.filter((s) => s.lessons.some((l) => l.id === currentId)).map((s) => s.id);
  const [open, setOpen] = useState<string[]>(
    initial.length ? initial : sections.slice(0, 1).map((s) => s.id)
  );

  const toggle = (id: string) => {
    setOpen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allLessons = sections.flatMap((s) => s.lessons);
  const doneCount = allLessons.filter((l) => l.done).length;
  const totalMinutes = allLessons.reduce((sum, l) => sum + (l.minutes ?? 0), 0);

  return (
    <div className={cn("space-y-3 font-sans", className)}>
      {showSummary && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400 bg-stone-100/70 dark:bg-stone-900/40 p-3 rounded-xl border border-stone-200/80 dark:border-stone-800">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{toPersianDigits(sections.length)} سرفصل اصلی</span>
          <span aria-hidden>·</span>
          <span>{toPersianDigits(allLessons.length)} جلسه و گفتار</span>
          {totalMinutes > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>{formatMinutes(totalMinutes)}</span>
            </>
          )}
          {doneCount > 0 && (
            <span className="ms-auto font-medium text-[#8A532B] dark:text-[#C58B43]">
              {toPersianDigits(doneCount)} از {toPersianDigits(allLessons.length)} درس تلمذ شده
            </span>
          )}
        </div>
      )}

      <div className="space-y-2">
        {sections.map((section) => {
          const isOpen = open.includes(section.id);
          const secLessons = section.lessons;
          const secDone = secLessons.filter((l) => l.done).length;

          return (
            <div
              key={section.id}
              className="rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#141518] overflow-hidden transition-shadow shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggle(section.id)}
                className="w-full flex items-center justify-between p-4 text-start hover:bg-stone-50 dark:hover:bg-zinc-800/40 transition cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {section.title}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                    {toPersianDigits(secDone)}/{toPersianDigits(secLessons.length)}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-zinc-500 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              {isOpen && (
                <div className="border-t border-stone-100 dark:border-stone-800/80 divide-y divide-stone-100 dark:divide-stone-800/60 bg-stone-50/50 dark:bg-black/20">
                  {secLessons.map((lesson) => {
                    const isCurrent = lesson.id === currentId;
                    const meta = kindMeta[lesson.kind || 'audio'] || kindMeta.audio;
                    const Icon = meta.icon;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => !lesson.locked && onSelect?.(lesson)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 text-xs transition cursor-pointer select-none",
                          isCurrent
                            ? "bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] font-bold"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-stone-100/70 dark:hover:bg-zinc-800/50",
                          lesson.locked && "opacity-60 cursor-not-allowed hover:bg-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {lesson.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                          ) : (
                            <Icon className="w-4 h-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                          )}
                          <span className="line-clamp-1">{lesson.title}</span>
                          {lesson.preview && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 font-mono">
                              نمونه آزاد
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                          {lesson.duration && <span>{toPersianDigits(lesson.duration)}</span>}
                          {lesson.minutes != null && <span>{toPersianDigits(lesson.minutes)} دقیقه</span>}
                          {lesson.locked && <Lock className="w-3.5 h-3.5 text-zinc-400 ms-1" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
