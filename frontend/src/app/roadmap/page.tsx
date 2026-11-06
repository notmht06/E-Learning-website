'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Compass,
  ArrowLeft,
  ChevronDown,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CurriculumRoadmap } from '@/components/CurriculumRoadmap';
import { useLanguage, lookupDictionary } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function RoadmapPage() {
  const { dict, toLocale, localizeHref, currentLang } = useLanguage();
  const { siteConfig, roadmapStages, roadmapFaqs } = useData();

  // Dynamic localization of FAQ items across Persian, Arabic, and English
  const faqIndices = [1, 2, 3, 4];
  const dynamicFaqs = faqIndices
    .map((i) => ({
      id: `faq-i18n-${i}`,
      q: lookupDictionary(dict, `roadmap_faq_${i}_q`),
      a: lookupDictionary(dict, `roadmap_faq_${i}_a`),
    }))
    .filter((item) => Boolean(item.q && item.a));

  const fallbackFaqs = [
    {
      id: 'faq-1',
      q: 'آیا یادگیری منطق برای ورود به فلسفه الزامی است؟',
      a: 'بله، منطق صوری و مادی، ترازوی سنجش تفکر و تشخیص برهان صحیح از مغالطه است. فهم دقیق مفاهیمی چون جنس، فصل، نوع، شرایط انتاج قیاس و برهان لِم و إن در فهم فلسفه اسلامی بنیادین است.',
    },
    {
      id: 'faq-2',
      q: 'چه زمانی می‌توان ورود به اسفار اربعه را آغاز کرد؟',
      a: 'پیش‌نیاز ضروری اسفار اربعه، تسلط بر بدایة الحکمة یا نهایة الحکمة، آشنایی با آراء مشائی ابن‌سینا در نجات و شفا، و منظومه حکمی ملاهادی سبزواری است.',
    },
    {
      id: 'faq-3',
      q: 'نقش علم اصول فقه در منظومه علوم عقلی چیست؟',
      a: 'اصول فقه، آزمایشگاهی توانمند در حوزه معرفت‌شناسی، تحلیل الفاظ و گزاره‌ها، و روش استنباط عقلی است که ذهن را برای تدقیق در غوامض فلسفی به بالاترین آمادگی می‌رساند.',
    },
    {
      id: 'faq-4',
      q: 'آیا مطالعه انفرادی کتب فلسفی بدون استاد راهنما توصیه می‌شود؟',
      a: 'متون فلسفه اسلامی دارای دقایق اصطلاحی و ابعاد برهانی ژرفی هستند که خوانش خودسرانه آن‌ها غالباً به بدفهمی یا مغالطات پیچیده می‌انجامد. تلمذ نزد استاد خبیر برای درک عمق مبانی ضروری است.',
    },
  ];

  // Prefer dynamic admin-configured FAQs when in Persian or available, otherwise fall back to localized/static FAQs
  const activeFaqs =
    currentLang === 'fa' && roadmapFaqs && roadmapFaqs.length > 0
      ? roadmapFaqs
      : dynamicFaqs.length > 0
      ? dynamicFaqs
      : roadmapFaqs && roadmapFaqs.length > 0
      ? roadmapFaqs
      : fallbackFaqs;

  const pageTitle =
    currentLang === 'fa' && siteConfig?.roadmap_title_fa
      ? siteConfig.roadmap_title_fa
      : dict.roadmap_stage_title;

  const pageSubtitle =
    currentLang === 'fa' && siteConfig?.roadmap_subtitle_fa
      ? siteConfig.roadmap_subtitle_fa
      : dict.roadmap_stage_subtitle;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-zinc-900 dark:text-zinc-100 transition-colors pb-12">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Breadcrumb & Title */}
        <div className="space-y-4 text-start border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Link href={localizeHref('/')} className="hover:text-zinc-700 dark:hover:text-zinc-200">
              {dict.nav_home}
            </Link>
            <span>/</span>
            <span className="text-[#8A532B]">{dict.nav_roadmap}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 mb-2">
                <Compass className="w-3.5 h-3.5" />
                <span>{dict.roadmap_tab_timeline || 'سیر مطالعاتی ترتیبی'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed mt-2 text-justify">
                {pageSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Sequential Curriculum Roadmap */}
        <section className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <CurriculumRoadmap stages={roadmapStages} />
          </motion.div>
        </section>

        {/* Study Methodology & FAQ Accordion */}
        <section className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-7 space-y-4 text-start shadow-xs">
          <div className="space-y-1 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <span className="text-[11px] font-mono text-[#8A532B] block">
              {dict.roadmap_faq_subtitle ? `[ ${dict.roadmap_faq_subtitle} ]` : '[ پرسش‌های متداول سیر علمی ]'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#8A532B]" />
              <span>{dict.roadmap_faq_title || 'پرسش‌های متداول درباره سیر مطالعاتی'}</span>
            </h3>
          </div>

          <div className="space-y-2.5 pt-1">
            {activeFaqs.map((item, idx) => (
              <details
                key={item.id || idx}
                className="group rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 overflow-hidden transition"
              >
                <summary className="p-4 flex items-center justify-between cursor-pointer list-none select-none text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[#8A532B] text-xs shrink-0">[{toLocale(idx + 1)}]</span>
                    <span>{item.q}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform duration-200 shrink-0" />
                </summary>

                <div className="p-4 pt-1 border-t border-zinc-200/60 dark:border-zinc-800 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
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
