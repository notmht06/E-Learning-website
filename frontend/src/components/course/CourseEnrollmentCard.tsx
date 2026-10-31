'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, Play, ShoppingBag, ArrowUpRight, Disc, Radio, AlertCircle } from 'lucide-react';

interface EnrollmentCardProps {
  courseId: string;
  price: string;
  isEnrolled: boolean;
  isLoading: boolean;
  error?: string | null;
  driveFolderId?: string;
  telegramUrl?: string;
  courseType?: 'offline' | 'online';
  schedule?: string;
  capacity?: number;
  enrolledCount?: number;
  skyroomUrl?: string;
  onEnroll: () => void;
  dict: Record<string, string>;
  currentLang: string;
}

export function CourseEnrollmentCard({
  courseId,
  price,
  isEnrolled,
  isLoading,
  error,
  driveFolderId,
  telegramUrl,
  courseType,
  schedule,
  capacity,
  enrolledCount,
  skyroomUrl,
  onEnroll,
  dict,
  currentLang,
}: EnrollmentCardProps) {
  const { localizeHref } = useLanguage();
  const driveHref = driveFolderId
    ? `https://drive.google.com/drive/folders/${driveFolderId}`
    : 'https://drive.google.com/drive/folders/1sUP_2GUpJsDLK1dRkXw4Vu065y9bza30?usp=sharing';

  return (
    <aside aria-label="ثبت‌نام دوره" className="lg:col-span-4 bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-6 shadow-xs sticky top-24">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-zinc-500 block font-bold">{dict.course_tuition_label}</span>
          {courseType === 'online' && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>کلاس آنلاین اسکای‌روم</span>
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#8A532B] dark:text-[#C58B43] font-num">{price}</span>
        </div>
      </div>

      {schedule && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-600/20 text-xs text-[#8A532B] dark:text-[#C58B43] space-y-1">
          <span className="font-bold block">زمان برگزاری کلاس آنلاین:</span>
          <span className="leading-relaxed">{schedule}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isEnrolled ? (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#8A532B]/10 border border-[#8A532B]/20 text-[#8A532B] dark:text-[#C58B43] text-xs sm:text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
            <span>{currentLang === 'en' ? 'Enrolled. All sessions are unlocked.' : currentLang === 'ar' ? 'تم التسجيل في هذه الدورة. جميع الجلسات متاحة.' : 'ثبت‌نام شده • تمامی جلسات باز است'}</span>
          </div>

          {courseType === 'online' && skyroomUrl && (
            <a
              href={skyroomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-emerald-300" />
              <span>{currentLang === 'en' ? 'Enter Live Skyroom Class' : currentLang === 'ar' ? 'الدخول إلى الصف المباشر (سكاي روم)' : 'ورود به کلاس آنلاین (اسکای‌روم)'}</span>
            </a>
          )}

          <Link
            href={localizeHref(`/courses/${courseId}/learn`)}
            className="w-full py-3 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{currentLang === 'en' ? 'Enter Course Player & Archive' : currentLang === 'ar' ? 'دخول بيئة التعلم ومشاهدة التسجيلات' : 'محیط یادگیری و جلسات ضبط‌شده'}</span>
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={onEnroll}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isLoading ? 'در حال ثبت‌نام...' : (dict.course_enroll_btn)}</span>
        </button>
      )}

      <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
          <span>{dict.hero_feature_stream}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
          <span>{currentLang === 'en' ? 'Direct scholarly interaction' : currentLang === 'ar' ? 'المباحثة العلمية مع الأستاذ' : 'امکان پرسش و پاسخ کتبی با استاد'}</span>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-start">
        <span className="text-[11px] font-mono text-zinc-400 block font-bold">مخازن رسمی صوت‌های درس:</span>
        <div className="flex flex-col gap-2">
          <a
            href={driveHref}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:border-[#8A532B] hover:text-[#8A532B] flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <Disc className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
              <span>پوشه صوت‌های دوره در گوگل درایو</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
          </a>
          {telegramUrl && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:border-[#8A532B] hover:text-[#8A532B] flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                <span>مشاهده در کانال تلگرام (@AlNajmosageb313)</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
