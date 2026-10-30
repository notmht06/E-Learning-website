'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui';

export function RoadmapBannerSection() {
  const { currentLang, dict, toLocale, localizeHref } = useLanguage();

  const STEPS = [
    {
      num: '01',
      title_fa: 'مبادی تفکر و منطق صوری',
      title_ar: 'مبادئ التفكير والمنطق الصوري',
      title_en: 'Foundations of Logic & Formal Epistemology',
      sub_fa: 'منطق مظفر و نقد مغالطات',
      sub_ar: 'المنطق للمظفر ونقد المغالطات',
      sub_en: 'Al-Mantiq & Fallacy Analysis',
    },
    {
      num: '02',
      title_fa: 'فلسفه مقدماتی (بدایة الحکمة)',
      title_ar: 'الفلسفة التأسيسية (بداية الحكمة)',
      title_en: 'Introductory Ontology (Bidayah)',
      sub_fa: 'اصالت وجود و احکام ماهیت',
      sub_ar: 'أصالة الوجود وأحكام الماهية',
      sub_en: 'Primacy of Being & Quiddity',
    },
    {
      num: '03',
      title_fa: 'فلسفه عالی و حکمت اشراق',
      title_ar: 'الفلسفة المتقدمة وحكمة الإشراق',
      title_en: 'Advanced Philosophy & Illumination',
      sub_fa: 'نهایة الحکمة و انوار سهروردی',
      sub_ar: 'نهاية الحكمة وأنوار السهروردي',
      sub_en: 'Nihayah & Suhrawardian Lights',
    },
    {
      num: '04',
      title_fa: 'کرسی خارج اسفار اربعه',
      title_ar: 'درس الخارج في الأسفار الأربعة',
      title_en: 'Transcendent Masterclass (Asfar)',
      sub_fa: 'سلوک برهانی در حکمت متعالیه',
      sub_ar: 'السلوك البرهاني في الحكمة المتعالية',
      sub_en: 'Metaphysical Mastery of Mulla Sadra',
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-8 select-none">
      <div className="relative rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white dark:bg-[#141518] p-6 sm:p-10 overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/30">
        {/* Folio 4-Corner Accents */}
        <span className="absolute top-3 start-3 w-2.5 h-2.5 border-t-2 border-s-2 border-[#8A532B] dark:border-[#C58B43] pointer-events-none" />
        <span className="absolute top-3 end-3 w-2.5 h-2.5 border-t-2 border-e-2 border-[#8A532B] dark:border-[#C58B43] pointer-events-none" />
        <span className="absolute bottom-3 start-3 w-2.5 h-2.5 border-b-2 border-s-2 border-[#8A532B] dark:border-[#C58B43] pointer-events-none" />
        <span className="absolute bottom-3 end-3 w-2.5 h-2.5 border-b-2 border-e-2 border-[#8A532B] dark:border-[#C58B43] pointer-events-none" />

        {/* Content Header & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8A532B]/10 dark:bg-[#C58B43]/10 text-[#8A532B] dark:text-[#C58B43] text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {currentLang === 'en'
                  ? 'COMPREHENSIVE LEARNING ROADMAP'
                  : currentLang === 'ar'
                  ? 'خارطة طريق العلوم العقلية'
                  : 'نقشه راه جامع فراگیری حکمت'}
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
              {currentLang === 'en'
                ? 'From Foundations of Logic to the Heights of Asfar'
                : currentLang === 'ar'
                ? 'من ألفباء المنطق إلى ذروة الحكمة المتعالية والأسفار الأربعة'
                : 'از الفبای منطق صوری تا اوج حکمت متعالیه و اسفار اربعه'}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {currentLang === 'en'
                ? 'A disciplined pedagogical curriculum formulated to prevent cognitive confusion and guarantee foundational mastery under Hojjat al-Islam Dr. Zanjirzan Hosseini.'
                : currentLang === 'ar'
                ? 'منهج دراسي مهندس بدقة يمنع التشتت الذهني ويضمن الرسوخ العلمي في المعقولات بتوجيه سماحة حجة الإسلام الدكتور زنجيرزن الحسيني.'
                : 'سیری مهندسی‌شده و گام‌به‌گام برای نجات پژوهشگران از پریشانی ذهنی؛ طراحی و تدریس‌شده بر اساس سنت اصیل کرسی درس خارج حجت الاسلام دکتر زنجیر زن حسینی.'}
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="bg-[#8A532B] text-white hover:bg-[#724423] dark:bg-[#C58B43] dark:text-[#0C0D0E] dark:hover:bg-[#b07b39] font-bold text-sm gap-2 shrink-0 self-start lg:self-center shadow-lg transition-transform duration-200 active:scale-95 group/btn"
          >
            <Link href={localizeHref('/roadmap')}>
              <span>
                {currentLang === 'en'
                  ? 'Explore Full Interactive Roadmap'
                  : currentLang === 'ar'
                  ? 'مشاهدة خارطة الطريق التفاعلية'
                  : 'مشاهده نقشه راه تعاملی مطالعات'}
              </span>
              <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 rtl:group-hover/btn:-translate-x-1 ltr:group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* 4 Interactive Roadmap Milestones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {STEPS.map((step, idx) => {
            const title =
              currentLang === 'en'
                ? step.title_en
                : currentLang === 'ar'
                ? step.title_ar
                : step.title_fa;
            const sub =
              currentLang === 'en'
                ? step.sub_en
                : currentLang === 'ar'
                ? step.sub_ar
                : step.sub_fa;

            return (
              <div
                key={step.num}
                className="relative rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-[#0C0D0E]/60 p-4 flex flex-col justify-between hover:border-[#8A532B]/50 dark:hover:border-[#C58B43]/50 transition-colors group"
              >
                {/* Milestone Step Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-[#8A532B]/10 dark:bg-[#C58B43]/10 text-[#8A532B] dark:text-[#C58B43] font-mono text-xs font-bold flex items-center justify-center">
                    {toLocale(step.num)}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500/70" />
                </div>

                {/* Milestone Title & Subtitle */}
                <div className="space-y-1">
                  <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition-colors leading-snug">
                    {title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {sub}
                  </p>
                </div>

                {/* Connecting arrow indicator for stages */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute -end-2.5 top-1/2 -translate-y-1/2 z-10">
                    <span className="w-5 h-5 rounded-full bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 text-[10px]">
                      ←
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
