'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Inbox, RefreshCw, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface SkeletonGridProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
}

export function SkeletonGrid({ count = 3, columns = 3 }: SkeletonGridProps) {
  const colClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${colClass} gap-5 w-full`} aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-[#E6E1D8] dark:border-[#22242A] bg-white dark:bg-[#141518] p-5 space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="h-5 w-20 rounded-md bg-[#EFECE6] dark:bg-[#1C1E22]" />
            <div className="h-7 w-7 rounded-lg bg-[#EFECE6] dark:bg-[#1C1E22]" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-4/5 rounded bg-[#EFECE6] dark:bg-[#1C1E22]" />
            <div className="h-4 w-3/5 rounded bg-[#EFECE6] dark:bg-[#1C1E22]" />
          </div>
          <div className="h-12 w-full rounded-xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A]" />
          <div className="pt-3 border-t border-[#E6E1D8] dark:border-[#22242A] flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-[#EFECE6] dark:bg-[#1C1E22]" />
            <div className="h-8 w-24 rounded-xl bg-[#EFECE6] dark:bg-[#1C1E22]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface EmptyStateCardProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
}

export function EmptyStateCard({
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  icon,
}: EmptyStateCardProps) {
  return (
    <div className="rounded-2xl border border-[#E6E1D8] dark:border-[#22242A] bg-white dark:bg-[#141518] p-8 sm:p-10 text-center space-y-4 shadow-2xs">
      <div className="w-12 h-12 rounded-2xl bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center mx-auto">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-base font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actionLabel && actionHref && (
        <div className="pt-1">
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold transition shadow-xs"
          >
            <span>{actionLabel}</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>
      )}
      {actionLabel && onActionClick && !actionHref && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onActionClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export interface InlineAlertProps {
  variant?: 'error' | 'success' | 'info';
  message: string;
  onRetry?: () => void;
}

export function InlineAlert({ variant = 'error', message, onRetry }: InlineAlertProps) {
  const { currentLang } = useLanguage();
  const retryText =
    currentLang === 'en' ? 'Retry' : currentLang === 'ar' ? 'إعادة المحاولة' : 'تلاش مجدد';

  const styles =
    variant === 'success'
      ? 'bg-[#8A532B]/10 border-[#8A532B]/30 text-[#8A532B] dark:text-[#E6CA85]'
      : variant === 'info'
      ? 'bg-[#EFECE6] dark:bg-[#18191D] border-[#E6E1D8] dark:border-[#262830] text-zinc-800 dark:text-zinc-200'
      : 'bg-rose-950/5 dark:bg-rose-950/30 border-rose-800/30 text-rose-800 dark:text-rose-300';

  return (
    <div
      role="alert"
      className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 text-start ${styles}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {variant === 'success' ? (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 shrink-0" />
        )}
        <span className="leading-relaxed">{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-3 py-1 rounded-lg bg-white/80 dark:bg-zinc-900 border border-current/20 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer hover:opacity-90 transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{retryText}</span>
        </button>
      )}
    </div>
  );
}
