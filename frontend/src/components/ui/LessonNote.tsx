'use client';

import React from 'react';
import {
  BookOpen,
  Clock,
  Target,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  FlaskConical,
  ListChecks,
  Quote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/lib/iranValidation';

export interface LessonNoteProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  minutes?: number;
  objectives?: React.ReactNode[];
}

/**
 * کامپوننت پوسته تقریرات و درس‌نامه تخصصی (VibeFarsi LessonNote)
 * مناسب برای متون فلسفی، حواشی علمی و خلاصه‌برداری با رعایت فاصله خطوط ارگونومیک و اهداف درس
 */
export function LessonNote({
  title,
  eyebrow,
  minutes,
  objectives,
  className,
  children,
  ...props
}: LessonNoteProps) {
  return (
    <article className={cn("space-y-6 text-zinc-900 dark:text-zinc-100 font-sans", className)} {...props}>
      <header className="space-y-2 border-b border-stone-200/80 dark:border-stone-800 pb-4">
        {eyebrow && (
          <p className="text-xs font-semibold text-[#8A532B] dark:text-[#C58B43]">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl sm:text-2xl font-bold leading-tight font-serif">
          {title}
        </h2>
        {minutes != null && (
          <p className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>زمان تقریبی قرائت: {toPersianDigits(minutes)} دقیقه</span>
          </p>
        )}
      </header>

      {objectives && objectives.length > 0 && (
        <section
          aria-label="مسائل و اهداف درس"
          className="rounded-xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/70 dark:bg-[#141518] p-4 space-y-3"
        >
          <p className="flex items-center gap-2 text-xs font-bold text-[#8A532B] dark:text-[#C58B43]">
            <Target className="w-4 h-4" />
            <span>مسائل محوری و دستاوردهای این درس‌گفتار</span>
          </p>
          <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-5 text-sm leading-8 text-zinc-800 dark:text-zinc-200">
        {children}
      </div>
    </article>
  );
}

export type CalloutKind = 'tip' | 'definition' | 'example' | 'warning' | 'summary' | 'quote';

const calloutMeta: Record<
  CalloutKind,
  { label: string; icon: React.ComponentType<{ className?: string }>; border: string; bg: string; text: string }
> = {
  tip: {
    label: 'نکته برهانی',
    icon: Lightbulb,
    border: 'border-[#8A532B]/30 dark:border-[#C58B43]/40',
    bg: 'bg-[#8A532B]/5 dark:bg-[#C58B43]/10',
    text: 'text-[#8A532B] dark:text-[#C58B43]',
  },
  definition: {
    label: 'تعریف اصطلاح',
    icon: BookOpen,
    border: 'border-stone-300 dark:border-stone-700',
    bg: 'bg-stone-100/60 dark:bg-zinc-900/60',
    text: 'text-zinc-900 dark:text-zinc-100',
  },
  example: {
    label: 'شاهد و مصداق',
    icon: FlaskConical,
    border: 'border-emerald-300 dark:border-emerald-800',
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  warning: {
    label: 'مغالطه یا اشتباه رایج',
    icon: AlertTriangle,
    border: 'border-amber-300 dark:border-amber-800',
    bg: 'bg-amber-50/60 dark:bg-amber-950/20',
    text: 'text-amber-800 dark:text-amber-400',
  },
  summary: {
    label: 'جمع‌بندی حکمی',
    icon: ListChecks,
    border: 'border-stone-300 dark:border-stone-700',
    bg: 'bg-stone-100/80 dark:bg-zinc-800/60',
    text: 'text-zinc-800 dark:text-zinc-200',
  },
  quote: {
    label: 'سخن قدما و کلام متن',
    icon: Quote,
    border: 'border-[#8A532B]/40 dark:border-[#C58B43]/50',
    bg: 'bg-[#FAF8F5] dark:bg-[#0C0D0E]',
    text: 'text-[#8A532B] dark:text-[#C58B43]',
  },
};

/**
 * باکس نکته و حاشیه علمی (Callout)
 */
export function Callout({
  kind = 'tip',
  title,
  children,
  className,
}: {
  kind?: CalloutKind;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const meta = calloutMeta[kind];
  const Icon = meta.icon;

  return (
    <aside
      className={cn(
        "rounded-xl border p-4 text-xs space-y-2 font-sans transition-colors",
        meta.border,
        meta.bg,
        className
      )}
    >
      <div className={cn("flex items-center gap-2 font-bold", meta.text)}>
        <Icon className="w-4 h-4 shrink-0" />
        <span>{title || meta.label}</span>
      </div>
      <div className="leading-7 text-zinc-700 dark:text-zinc-300 ps-6">
        {children}
      </div>
    </aside>
  );
}

/**
 * فهرست اصطلاحات کلیدی (KeyTerms)
 */
export function KeyTerms({
  terms,
  className,
}: {
  terms: { term: string; definition: string }[];
  className?: string;
}) {
  return (
    <dl className={cn("space-y-3 font-sans", className)}>
      {terms.map((t, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#141518] p-3 text-xs space-y-1"
        >
          <dt className="font-bold text-zinc-900 dark:text-zinc-100 text-[13px]">
            {t.term}
          </dt>
          <dd className="text-zinc-600 dark:text-zinc-400 leading-relaxed ps-2 border-s-2 border-[#8A532B] dark:border-[#C58B43]">
            {t.definition}
          </dd>
        </div>
      ))}
    </dl>
  );
}
