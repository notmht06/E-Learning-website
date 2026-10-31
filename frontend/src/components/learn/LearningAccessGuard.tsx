'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Check, ArrowLeft, Shield, LogIn } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { triggerTactileHaptic } from '@/lib/haptics';

export interface LearningAccessGuardProps {
  courseId: string;
  courseTitle: string;
  chapterTitle?: string;
  price?: string | number;
  isFree?: boolean;
  onDismiss?: () => void;
}

export function LearningAccessGuard({
  courseId,
  courseTitle,
  chapterTitle,
  price,
  isFree = false,
  onDismiss,
}: LearningAccessGuardProps) {
  const { toLocale, dict, currentLang, localizeHref } = useLanguage();
  const { user } = useAuth();

  const formattedPrice =
    typeof price === 'string' && price.length > 0
      ? price
      : isFree || price === 0 || !price
      ? dict.course_free_badge
      : `${toLocale(price.toLocaleString('fa-IR'))} ${dict.course_currency_toman}`;

  const benefits = [
    dict.guard_benefit_1,
    dict.guard_benefit_2,
    dict.guard_benefit_3,
    dict.guard_benefit_4,
  ];

  return (
    <div className="w-full bg-[#0C0D0E] border border-[#22242A] rounded-2xl p-6 sm:p-8 text-start relative overflow-hidden select-none">
      {/* Folio Corner Accents */}
      <span className="absolute top-2 start-2 w-3 h-3 border-t border-s border-[#8A532B]/40 pointer-events-none" />
      <span className="absolute top-2 end-2 w-3 h-3 border-t border-e border-[#8A532B]/40 pointer-events-none" />
      <span className="absolute bottom-2 start-2 w-3 h-3 border-b border-s border-[#8A532B]/40 pointer-events-none" />
      <span className="absolute bottom-2 end-2 w-3 h-3 border-b border-e border-[#8A532B]/40 pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Emblem & Lock Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22242A] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#141518] border border-[#8A532B]/40 flex items-center justify-center text-[#C58B43] shrink-0">
              <Lock className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#C58B43]">
                  {dict.guard_access_required}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#FAF8F5]">
                {chapterTitle || courseTitle}
              </h2>
            </div>
          </div>

          <div className="text-start sm:text-end shrink-0">
            <span className="text-[11px] text-zinc-500 block">
              {dict.course_tuition_label}
            </span>
            <span className="text-base font-bold text-[#E6CA85] font-num">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {dict.guard_access_desc}
        </p>

        {/* Course Core Benefits */}
        <div className="bg-[#141518] border border-[#22242A] rounded-xl p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C58B43]">
            <Shield className="w-3.5 h-3.5" />
            <span>
              {dict.ui_course_benefits_academic_guarantees}
            </span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43] shrink-0 mt-0.5" />
                <span className="leading-snug">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Primary Enroll / Checkout CTA */}
            <Link
              href={localizeHref(`/checkout?courseId=${encodeURIComponent(courseId)}`)}
              onClick={() => triggerTactileHaptic('thump')}
              className="px-6 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Shield className="w-4 h-4 text-[#E6CA85]" />
              <span>
                {dict.guard_enroll_btn}
              </span>
            </Link>

            {/* Login CTA if not logged in */}
            {!user && (
              <Link
                href={localizeHref(`/login?redirect=${encodeURIComponent(localizeHref(`/courses/${courseId}/learn`))}`)}
                onClick={() => triggerTactileHaptic('tick')}
                className="px-4 py-3 rounded-xl bg-[#141518] border border-[#22242A] hover:border-[#8A532B] text-zinc-300 hover:text-[#FAF8F5] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#C58B43]" />
                <span>
                  {dict.guard_login_btn}
                </span>
              </Link>
            )}
          </div>

          {/* Secondary Back to Course Overview link */}
          <Link
            href={localizeHref(`/courses/${courseId}`)}
            onClick={() => triggerTactileHaptic('tick')}
            className="px-4 py-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition flex items-center justify-center gap-1.5 self-center sm:self-auto cursor-pointer"
          >
            <span>
              {dict.guard_back_to_course}
            </span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
