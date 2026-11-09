'use client';

import React from 'react';
import { Layers, Headphones, BookOpen, Award } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function VibeFarsiMarquee() {
  const { toLocale } = useLanguage();

  const treatisesRow1 = [
    'اسفار اربعه صدرالمتألهین',
    'شرح اشارات و تنبیهات',
    'منطق مظفر',
    'بدایة الحکمة',
    'نهایة الحکمة',
    'شرح منظومه سبزواری',
    'شفا ابن سینا',
    'تجرید الاعتقاد',
    'حکمة الاشراق سهروردی',
  ];

  const featuresRow2 = [
    'استریم صوتی و تصویری استودیویی',
    'حکمت‌یار هوشمند دروس (AI)',
    'تقریرات منقح و مصحح جلسات',
    'سیر مطالعاتی گام‌به‌گام',
    'گواهی‌نامه رسمی علمی با QR',
    'پخش صوتی با مصرف بهینه دیتای موبایل',
    'پروتکل امنیتی DRM و توکن‌های منقضی‌شونده',
  ];

  const stats = [
    { num: `+${toLocale(25)} سال`, label: 'سابقه تدریس تخصصی علوم عقلی', icon: <BookOpen className="w-4 h-4" /> },
    { num: `+${toLocale('1,200')} جلسه`, label: 'درس‌گفتار صوتی و تصویری ضبط‌شده', icon: <Headphones className="w-4 h-4" /> },
    { num: `${toLocale(8)} شاخه`, label: 'حکمت، منطق، کلام، اصول و عرفان', icon: <Layers className="w-4 h-4" /> },
    { num: `${toLocale(100)}٪ متون`, label: 'تقریرات منقح همراه با نمودار استدلال', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <section className="w-full py-10 space-y-8 overflow-hidden bg-white/60 dark:bg-[#111215]/60 border-y border-[#E6E1D8] dark:border-[#27282D]">
      {/* 1. Counter Stats with Persian Numerals */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-start">
          {stats.map((st, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-[#E6E1D8] dark:border-[#27282D] bg-[#FAF8F5] dark:bg-[#141518] space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center gap-2 text-[#8A532B] dark:text-[#C58B43]">
                {st.icon}
                <span className="text-xl sm:text-2xl font-extrabold tabular-nums font-sans">
                  {st.num}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                {st.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Dual-Row RTL Marquee Pills */}
      <div className="space-y-3 select-none">
        {/* Marquee Row 1 */}
        <div className="flex gap-3 overflow-hidden whitespace-nowrap">
          <div className="flex gap-3 animate-marquee-rtl shrink-0">
            {treatisesRow1.concat(treatisesRow1).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#16171B] text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 (Reverse speed) */}
        <div className="flex gap-3 overflow-hidden whitespace-nowrap">
          <div className="flex gap-3 animate-marquee-rtl-reverse shrink-0">
            {featuresRow2.concat(featuresRow2).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E6E1D8] dark:border-[#27282D] bg-[#FAF8F5] dark:bg-[#131417] text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                <span className="w-1 h-1 rounded-full bg-zinc-400" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default VibeFarsiMarquee;
