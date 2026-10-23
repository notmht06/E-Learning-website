'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  Clock,
  ChevronDown,
  ListTree,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { StageData, roadmapStagesData } from '@/lib/roadmapData';

export { roadmapStagesData };
export type { StageData };

export const CurriculumRoadmap: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { toLocale, dict, currentLang } = useLanguage();
  const [completedStages, setCompletedStages] = useState<number[]>([1]);
  const [expandedStageIds, setExpandedStageIds] = useState<string[]>(['stage-1', 'stage-2']);

  const toggleStage = (id: string) => {
    setExpandedStageIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const getLocalizedStage = (stage: StageData) => {
    const isEn = currentLang === 'en';
    const isAr = currentLang === 'ar';
    return {
      id: stage.id,
      stepNumber: stage.stepNumber,
      title: isEn ? stage.title_en : isAr ? stage.title_ar : stage.title_fa,
      subtitle: isEn ? stage.subtitle_en : isAr ? stage.subtitle_ar : stage.subtitle_fa,
      description: isEn ? stage.description_en : isAr ? stage.description_ar : stage.description_fa,
      outcomes: isEn ? stage.outcomes_en : isAr ? stage.outcomes_ar : stage.outcomes_fa,
      keyBooks: isEn ? stage.keyBooks_en : isAr ? stage.keyBooks_ar : stage.keyBooks_fa,
      sessionEstimate: isEn ? stage.sessionEstimate_en : isAr ? stage.sessionEstimate_ar : stage.sessionEstimate_fa,
      level: isEn ? stage.level_en : isAr ? stage.level_ar : stage.level_fa,
      category: isEn ? stage.category_en : isAr ? stage.category_ar : stage.category_fa,
      coursesList: stage.coursesList.map((c) => ({
        title: isEn ? c.title_en : isAr ? c.title_ar : c.title_fa,
        sessions: isEn ? c.sessions_en : isAr ? c.sessions_ar : c.sessions_fa,
        slug: c.slug,
      })),
    };
  };

  return (
    <div className="w-full space-y-6 text-start">
      {/* Quick Navigation Anchor Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 scrollbar-none">
        <span className="text-xs font-bold text-zinc-500 shrink-0">
          {dict.roadmap_quick_jump || 'جهش سریع به مرحله:'}
        </span>
        {roadmapStagesData.map((stage) => {
          const loc = getLocalizedStage(stage);
          return (
            <a
              key={stage.id}
              href={`#${stage.id}`}
              className="text-xs px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800/80 hover:bg-[#8A532B]/10 hover:text-[#8A532B] dark:hover:text-[#C58B43] text-zinc-700 dark:text-zinc-300 font-num transition shrink-0"
            >
              [ ۰{stage.stepNumber} ] {loc.category}
            </a>
          );
        })}
      </div>

      {/* Continuous Vertical Timeline Stepper */}
      <div className="relative border-s-2 border-zinc-100 dark:border-zinc-800 ms-4 sm:ms-6 ps-6 sm:ps-8 space-y-8 pt-2 pb-6">
        {roadmapStagesData.map((rawStage) => {
          const stage = getLocalizedStage(rawStage);
          const isCompleted = completedStages.includes(rawStage.stepNumber);
          const isCurrent = rawStage.stepNumber === 2;
          const isPending = !isCompleted && !isCurrent;
          const isExpanded = expandedStageIds.includes(stage.id);

          return (
            <div
              key={stage.id}
              id={stage.id}
              className="relative group scroll-mt-24"
            >
              {/* Stepper Node on Line */}
              {isCompleted ? (
                <div
                  className="absolute -start-[41px] sm:-start-[49px] top-2 w-8 h-8 rounded-full bg-[#8A532B] text-white flex items-center justify-center shadow-xs z-10"
                  title={dict.roadmap_step_completed || 'مرحله سپری‌شده'}
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
              ) : isCurrent ? (
                <div
                  className="absolute -start-[41px] sm:-start-[49px] top-2 w-8 h-8 rounded-full border-2 border-[#8A532B] bg-white dark:bg-[#0C0D0E] text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center text-xs font-bold font-num shadow-xs ring-4 ring-[#8A532B]/20 z-10"
                  title={dict.roadmap_step_current || 'مرحله جاری مطالعاتی'}
                >
                  ۰{stage.stepNumber}
                </div>
              ) : (
                <div
                  className="absolute -start-[41px] sm:-start-[49px] top-2 w-8 h-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0C0D0E] text-zinc-400 dark:text-zinc-500 flex items-center justify-center text-xs font-bold font-num z-10"
                  title={dict.roadmap_step_pending || 'مرحله در انتظار'}
                >
                  ۰{stage.stepNumber}
                </div>
              )}

              {/* Stage Card with Accordion-based Disclosure */}
              <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                {/* Header Summary Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-3 py-0.5 rounded border font-num ${
                          isCompleted
                            ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/60 text-[#8A532B] dark:text-[#C58B43] border-[#8A532B]/30 dark:border-[#C58B43]/30'
                            : isCurrent
                            ? 'bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] border-[#8A532B]/20'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {isCompleted
                          ? dict.roadmap_step_completed || 'مرحله سپری‌شده'
                          : isCurrent
                          ? dict.roadmap_step_current || 'مرحله جاری مطالعاتی'
                          : dict.roadmap_step_pending || 'مرحله در انتظار'}{' '}
                        • {dict.roadmap_step_prefix || 'منزل'} {toLocale(stage.stepNumber)} {dict.reader_of || 'از'} {toLocale(5)}
                      </span>
                      <span className="text-xs text-zinc-500 font-num flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{stage.sessionEstimate}</span>
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {stage.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                      {stage.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded">
                      {stage.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleStage(stage.id)}
                      className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#8A532B]/40 dark:hover:border-[#C58B43]/40 bg-zinc-50 dark:bg-zinc-800/80 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition flex items-center gap-2 cursor-pointer"
                      aria-expanded={isExpanded}
                    >
                      <span>
                        {isExpanded
                          ? dict.roadmap_collapse_details || 'بستن جزئیات سرفصل'
                          : dict.roadmap_toggle_details || 'جزئیات سرفصل‌ها و منابع'}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Collapsible Accordion Disclosure */}
                {isExpanded && (
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-6">
                    {/* Prerequisites & Description */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-7 space-y-4">
                        {/* Prerequisites */}
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                            <ListTree className="w-3.5 h-3.5 text-[#8A532B]" />
                            <span>{dict.roadmap_prerequisites || 'پیش‌نیازهای این مرحله:'}</span>
                          </span>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {stage.stepNumber === 1
                              ? (dict.roadmap_prereq_none || 'فاقد پیش‌نیاز (مرحله مدخل و آغازین علوم عقلی).')
                              : `${dict.roadmap_step_prefix || 'منزل'} ${toLocale(stage.stepNumber - 1)} و تسلط بر کتب و متون درسی آن.`}
                          </p>
                        </div>

                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
                          {stage.description}
                        </p>

                        {/* Learning Outcomes */}
                        <div className="space-y-2 pt-1">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                            {dict.roadmap_learning_outcomes || dict.roadmap_outcomes_title || 'دستاوردهای علمی و مهارتی:'}
                          </span>
                          <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                            {stage.outcomes.map((out, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43] shrink-0 mt-0.5" />
                                <span>{out}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Reference Books */}
                      <div className="lg:col-span-5 bg-zinc-50 dark:bg-[#18191D] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          <BookOpen className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
                          <span>{dict.roadmap_reference_books || dict.roadmap_books_title || 'کتب و متون درسی مرجع:'}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {stage.keyBooks.map((kb, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 font-num"
                            >
                              {kb}
                            </span>
                          ))}
                        </div>

                        <span className="text-[11px] text-zinc-500 block pt-1">
                          {dict.course_instructor_label || 'مدرس:'} {dict.scholar_name || 'حجت الاسلام دکتر زنجیر زن حسینی'}
                        </span>
                      </div>
                    </div>

                    {/* Course Linkage List */}
                    <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                        {dict.roadmap_associated_courses || dict.roadmap_courses_title || 'درس‌گفتارهای مرتبط با این مرحله در آرشیو:'}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {stage.coursesList.map((course, idx) => (
                          <Link
                            key={idx}
                            href="/courses"
                            className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[#8A532B]/40 dark:hover:border-[#C58B43]/40 transition flex items-center justify-between gap-2 group"
                          >
                            <div className="min-w-0">
                              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] truncate transition">
                                {course.title}
                              </h3>
                              <span className="text-[11px] text-zinc-500 font-num">
                                {course.sessions}
                              </span>
                            </div>
                            <ArrowLeft className="w-3.5 h-3.5 text-zinc-400 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 rtl:rotate-0 ltr:rotate-180 transition shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
