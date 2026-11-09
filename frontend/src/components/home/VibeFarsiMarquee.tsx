'use client';

import React from 'react';
import { Layers, Headphones, BookOpen, Award } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function VibeFarsiMarquee() {
  const { toLocale } = useLanguage();

  const stats = [
    { num: `+${toLocale(25)} سال`, label: 'سابقه تدریس تخصصی علوم عقلی', icon: <BookOpen className="w-4 h-4" /> },
    { num: `+${toLocale('1,200')} جلسه`, label: 'درس‌گفتار صوتی و تصویری ضبط‌شده', icon: <Headphones className="w-4 h-4" /> },
    { num: `${toLocale(8)} شاخه`, label: 'حکمت، منطق، کلام، اصول و عرفان', icon: <Layers className="w-4 h-4" /> },
    { num: `${toLocale(100)}٪ متون`, label: 'تقریرات منقح همراه با نمودار استدلال', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <section className="w-full py-6 bg-white/60 dark:bg-[#111215]/60 border-y border-[#E6E1D8] dark:border-[#27282D]">
      {/* 4 Counter Stats with Persian Numerals */}
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
    </section>
  );
}

export default VibeFarsiMarquee;
