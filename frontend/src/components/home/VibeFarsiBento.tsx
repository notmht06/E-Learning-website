'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Compass,
  ShieldCheck,
  Check,
  ArrowLeft,
  Quote,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function VibeFarsiBento() {
  const { toLocale, localizeHref = (p) => p } = useLanguage();

  // Search bento state
  const [selectedTag, setSelectedTag] = useState('اصالت وجود');
  const searchResults: Record<string, { title: string; ref: string }[]> = {
    'اصالت وجود': [
      { title: 'برهان صدیقین در اسفار اربعه', ref: 'درس‌گفتار اسفار • جلسه ۳' },
      { title: 'اعتباریت ماهیت و شبهه ابن کمونه', ref: 'بدایة الحکمة • مرحله ۱' },
    ],
    'تشکیک نور': [
      { title: 'مراتب انوار قاهره و سافله سهروردی', ref: 'حکمت اشراق • جلسه ۵' },
      { title: 'وحدت در کثرت و کثرت در وحدت', ref: 'شرح منظومه • فصل ۲' },
    ],
    'صناعات خمس': [
      { title: 'شرایط انتاج برهان لمی و انی', ref: 'منطق مظفر • جلسه ۱۴' },
      { title: 'مغالطات لفظی و معنوی در مناظره', ref: 'حکمت مشاء • جلسه ۸' },
    ],
  };

  // DRM Quality selector state
  const [activeQuality, setActiveQuality] = useState('۱۰۸۰p');

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-8 text-start space-y-6">
      {/* Section Header */}
      <div className="space-y-1.5 text-center sm:text-start">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8A532B]/10 dark:bg-[#C58B43]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>امکانات زنده پلتفرم</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          ابزارهای تخصصی تدریس و پژوهش علوم عقلی
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
          هر امکان بر پایه استانداردهای بومی و تایپوگرافی دقیق دانا طراحی شده تا فضای مباحثه علمی و حفظ کرامت درس خارج محقق شود.
        </p>
      </div>

      {/* 4-Card Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">

        {/* Bento 1: Lesson Notes (span 7) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#141518] p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-[#8A532B] dark:text-[#C58B43]">
                <FileText className="w-4 h-4" />
                <span>درس‌نامه و تقریرات منقح جلسه</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono">
                Markdown + Typography
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              پیاده‌سازی دقیق متن دروس به همراه نمودار استدلال
            </h3>

            {/* Interactive Callout Quote Preview */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#111215] border-r-4 border-r-[#8A532B] dark:border-r-[#C58B43] border border-[#E6E1D8] dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <Quote className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                <span>گزیده تقریر درس خارج اسفار:</span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                «تمایز وجود از ماهیت یک تمایز مفهومی است و در دارِ تحقق، چیزی جز وجودِ مشکک اصالت ندارد. ماهیت صرفاً قالب و اندازهٔ حدود امکانی است.»
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-[11px] text-zinc-400 font-medium">
              ساخته‌شده با: LessonNote + MonographCallout
            </span>
            <Link
              href={localizeHref('/courses')}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#8A532B] dark:text-[#C58B43] hover:underline"
            >
              <span>مشاهده نمونه تقریر</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bento 2: Smart Search ⌘K (span 5) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#141518] p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-[#8A532B] dark:text-[#C58B43]">
                <Search className="w-4 h-4" />
                <span>جست‌وجوی مفهومی ⌘K</span>
              </span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                ⌘K
              </kbd>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              جست‌وجوی همزمان در صوت، متن و سرفصل‌ها
            </h3>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              {['اصالت وجود', 'تشکیک نور', 'صناعات خمس'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[#8A532B] text-white shadow-2xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Live Results Preview */}
            <div className="space-y-1.5 pt-1">
              {(searchResults[selectedTag] || []).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-xs flex items-center justify-between"
                >
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.title}</span>
                  <span className="text-[10px] text-zinc-400">{item.ref}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-400">
            ساخته‌شده با: SearchPalette + ASTIndex
          </div>
        </div>

        {/* Bento 3: Timeline & Prerequisite Stages (span 6) */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#141518] p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-[#8A532B] dark:text-[#C58B43]">
                <Compass className="w-4 h-4" />
                <span>سیر مطالعاتی و تقدم و تأخر دروس</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-900/60">
                ۴ مرحله تدریجی
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              نقشه راه مصوب جهت تحصیل اجتهادی حکمت
            </h3>

            {/* Step progression bar */}
            <div className="space-y-2 pt-1 text-xs">
              {[
                { stage: 'مرحله اول: منطق صوری و اجتهادی', sub: 'منطق مظفر و شرح شمسیه', state: 'پایان‌یافته' },
                { stage: 'مرحله دوم: فلسفه مقدماتی و متوسطه', sub: 'بدایة الحکمة و نهایة الحکمة', state: 'در حال تحصیل' },
                { stage: 'مرحله سوم: حکمت اشراق و مشاء', sub: 'حکمة الاشراق و اشارات و تنبیهات', state: 'در انتظار' },
              ].map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                  <div className="space-y-0.5">
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{s.stage}</p>
                    <p className="text-[10px] text-zinc-400">{s.sub}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    s.state === 'پایان‌یافته'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : s.state === 'در حال تحصیل'
                      ? 'bg-[#8A532B]/15 text-[#8A532B] dark:text-[#C58B43]'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}>
                    {s.state}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-[11px] text-zinc-400 font-medium">
              ساخته‌شده با: RoadmapStepper + TimelineNode
            </span>
            <Link
              href={localizeHref('/roadmap')}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#8A532B] dark:text-[#C58B43] hover:underline"
            >
              <span>نقشه راه کامل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bento 4: DRM Player & Adaptive Bitrate (span 6) */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#141518] p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-[#8A532B] dark:text-[#C58B43]">
                <ShieldCheck className="w-4 h-4" />
                <span>پلیر حرفه‌ای با قفل DRM و کنترل کیفیت</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono">
                RFC 7233 Range
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              تغییر کیفیت تصویر در لحظه و حالت اختصاصی صوت
            </h3>

            {/* Quality Switcher Pills */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] text-zinc-500">کیفیت‌های در دسترس استریم:</p>
              <div className="flex flex-wrap gap-2">
                {['۱۰۸۰p', '۷۲۰p', '۴۸۰p', '۳۶۰p', 'فقط صوت'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setActiveQuality(q)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                      activeQuality === q
                        ? 'bg-[#8A532B] text-white border-[#8A532B]'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {activeQuality === q && <Check className="w-3.5 h-3.5" />}
                    <span>{q}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500 pt-1 leading-relaxed">
                در حالت {activeQuality}، پخش ویدیو بدون کوچک‌ترین وقفه با بافر هوشمند و کدک H.264 انجام می‌شود.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-400">
            ساخته‌شده با: AudioVideoPlayerEngine + DynamicBitrate
          </div>
        </div>

      </div>
    </section>
  );
}

export default VibeFarsiBento;
