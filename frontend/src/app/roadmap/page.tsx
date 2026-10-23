'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowLeft,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CurriculumRoadmap } from '@/components/CurriculumRoadmap';
import { ConceptGraphVisualizer } from '@/components/concept-graph';
import { useLanguage } from '@/context/LanguageContext';

export default function RoadmapPage() {
  const { dict, toLocale } = useLanguage();
  const [viewMode, setViewMode] = useState<'timeline' | 'graph'>('timeline');

  // Dynamic localization of FAQ items across Persian, Arabic, and English
  const faqIndices = [1, 2, 3, 4];
  const dynamicFaqs = faqIndices
    .map((i) => ({
      q: dict[`roadmap_faq_${i}_q`],
      a: dict[`roadmap_faq_${i}_a`],
    }))
    .filter((item) => Boolean(item.q && item.a));

  const fallbackFaqs = [
    {
      q: 'آیا یادگیری منطق برای ورود به فلسفه الزامی است؟',
      a: 'بله، منطق صوری و مادی، ترازوی سنجش تفکر و تشخیص برهان صحیح از مغالطه است. فهم دقیق مفاهیمی چون جنس، فصل، نوع، شرایط انتاج قیاس و برهان لِم و إن در فهم فلسفه اسلامی بنیادین است.',
    },
    {
      q: 'چه زمانی می‌توان ورود به اسفار اربعه را آغاز کرد؟',
      a: 'پیش‌نیاز ضروری اسفار اربعه، تسلط بر بدایة الحکمة یا نهایة الحکمة، آشنایی با آراء مشائی ابن‌سینا در نجات و شفا، و منظومه حکمی ملاهادی سبزواری است.',
    },
    {
      q: 'نقش علم اصول فقه در منظومه علوم عقلی چیست؟',
      a: 'اصول فقه، آزمایشگاهی توانمند در حوزه معرفت‌شناسی، تحلیل الفاظ و گزاره‌ها، و روش استنباط عقلی است که ذهن را برای تدقیق در غوامض فلسفی به بالاترین آمادگی می‌رساند.',
    },
    {
      q: 'آیا مطالعه انفرادی کتب فلسفی بدون استاد راهنما توصیه می‌شود؟',
      a: 'متون فلسفه اسلامی دارای دقایق اصطلاحی و ابعاد برهانی ژرفی هستند که خوانش خودسرانه آن‌ها غالباً به بدفهمی یا مغالطات پیچیده می‌انجامد. تلمذ نزد استاد خبیر برای درک عمق مبانی ضروری است.',
    },
  ];

  const faqItems = dynamicFaqs.length > 0 ? dynamicFaqs : fallbackFaqs;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-zinc-900 dark:text-zinc-100 transition-colors pb-8">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Breadcrumb & Title */}
        <div className="space-y-4 text-start border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200">
              {dict.nav_home || 'صفحه اصلی'}
            </Link>
            <span>/</span>
            <span className="text-[#8A532B]">{dict.nav_roadmap || 'سیر مطالعاتی و نقشه راه'}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {dict.roadmap_stage_title || 'سیر مطالعاتی گام‌به‌گام علوم عقلی و نقلی'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mt-1">
                {dict.roadmap_stage_subtitle || 'نقشه راه استاندارد و تفکیک‌شده تدریس حجت الاسلام دکتر زنجیر زن حسینی، از مرحله سنجش فکر و منطق، تا حکمت پایه، اصول اجتهاد، اسفار اربعه و عرفان نظری.'}
              </p>
            </div>

            {/* View Switcher: Sequential Timeline vs Concept Graph */}
            <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl border border-black/5 dark:border-white/5 shrink-0 self-start sm:self-center">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-[#8A532B] text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {dict.roadmap_tab_timeline || 'سیر مطالعاتی ترتیبی'}
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  viewMode === 'graph'
                    ? 'bg-[#8A532B] text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {dict.roadmap_tab_graph || 'شبکه ارتباطی مفاهیم عقلی'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic View Display */}
        <section className="space-y-4">
          {viewMode === 'timeline' ? <CurriculumRoadmap /> : <ConceptGraphVisualizer />}
        </section>

        {/* Study Methodology & FAQ Accordion */}
        <section className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 text-start shadow-xs">
          <div className="space-y-1 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <span className="text-[11px] font-mono text-[#8A532B] block">
              {dict.roadmap_faq_subtitle ? `[ ${dict.roadmap_faq_subtitle} ]` : '[ پرسش‌های متداول سیر علمی ]'}
            </span>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {dict.roadmap_faq_title || 'اصول سیر علمی، تقدم و تاخر خوانش دروس'}
            </h3>
          </div>

          <div className="space-y-2">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                className="group rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 overflow-hidden transition"
              >
                <summary className="p-4 flex items-center justify-between cursor-pointer list-none select-none text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400 text-[11px] shrink-0">[{toLocale(idx + 1)}]</span>
                    <span>{item.q}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform duration-200 shrink-0" />
                </summary>

                <div className="p-4 pt-1 border-t border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
