'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface ShellAuthGateProps {
  portalType: 'student' | 'admin';
  title?: string;
  description?: string;
  demoActionLabel?: string;
  onDemoLogin: () => void;
  returnHomeLabel?: string;
}

export function ShellAuthGate({
  portalType,
  title,
  description,
  demoActionLabel,
  onDemoLogin,
  returnHomeLabel,
}: ShellAuthGateProps) {
  const { isRtl, dict, localizeHref } = useLanguage();

  const defaultTitle = portalType === 'admin'
    ? dict.auth_login_admin
    : dict.auth_login_student;

  const defaultDesc = portalType === 'admin'
    ? dict.auth_desc_admin
    : dict.auth_desc_student;

  const defaultDemoBtn = portalType === 'admin'
    ? dict.auth_demo_admin
    : dict.auth_demo_student;

  const defaultReturnLabel = dict.nav_home_return;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0D0E] flex items-center justify-center p-4 sm:p-6 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 text-start shadow-xs">
        {/* Soft-colored circular icon wrapper */}
        <div className="w-12 h-12 rounded-full bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center mx-auto shrink-0">
          {portalType === 'admin' ? (
            <ShieldAlert className="w-6 h-6" />
          ) : (
            <Lock className="w-6 h-6" />
          )}
        </div>

        {/* Header Texts */}
        <div className="text-center space-y-2">
          <span className="text-[11px] font-mono text-[#8A532B] dark:text-[#C58B43] block">
            {portalType === 'admin' ? dict.auth_tag_admin : dict.auth_tag_student}
          </span>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {title || defaultTitle}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            {description || defaultDesc}
          </p>
        </div>

        {/* Scholar Attribution */}
        <div className="text-center py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span>{dict.scholar_chair_attribution}</span>{' '}
          <strong className="font-bold text-zinc-800 dark:text-zinc-200">
            {dict.scholar_badge}
          </strong>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={onDemoLogin}
            className="w-full py-3 px-4 rounded-xl bg-[#8A532B] hover:bg-[#724320] active:scale-[0.99] text-white text-xs font-medium transition cursor-pointer shadow-xs text-center"
          >
            {demoActionLabel || defaultDemoBtn}
          </button>

          <Link
            href={localizeHref('/')}
            className="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            <span>{returnHomeLabel || defaultReturnLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
