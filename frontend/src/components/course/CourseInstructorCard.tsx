'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { triggerTactileHaptic } from '@/lib/haptics';

interface CourseInstructorCardProps {
  className?: string;
}

export function CourseInstructorCard({ className = '' }: CourseInstructorCardProps) {
  const { currentLang, dict } = useLanguage();

  const scholarName =
    currentLang === 'en'
      ? 'Hojjat al-Islam Dr. Zanjirzan Hosseini'
      : currentLang === 'ar'
      ? 'حجة الإسلام الدكتور زنجير زن حسيني'
      : 'حجت الاسلام دکتر زنجیر زن حسینی';

  const scholarTitle =
    dict.course_scholar_title_desc ||
    (currentLang === 'en'
      ? 'Professor of Advanced Seminary Studies & Rational Sciences'
      : currentLang === 'ar'
      ? 'أستاذ السطوح العليا والبحث الخارج • باحث في العلوم العقلية والنقلية'
      : 'استاد سطوح عالی و خارج حوزه علمیه • پژوهشگر علوم عقلی و نقلی');

  const bio =
    currentLang === 'en'
      ? "Professor of advanced seminary studies (Dars-e Kharij) in Jurisprudence, Legal Theory, Philosophy, and Rational Theology; critical commentator on Transcendent Philosophy and foundational treatises of Islamic wisdom with over 15 years of continuous scholarly research."
      : currentLang === 'ar'
      ? 'أستاذ السطوح العليا والبحث الخارج في الفقه والأصول والفلسفة والكلام في الحوزة العلمية؛ شارح الأسفار الأربعة وبداية ونهاية الحكمة بخبرة تمتد لأكثر من ١٥ عاماً في التدريس والتحقيق الحوزوي والأكاديمي.'
      : 'مدرس سطوح عالی و درس خارج فقه، اصول، فلسفه و کلام در حوزه علمیه؛ شارح منظومه، بدایة الحکمة، نهایة الحکمة و اسفار اربعه صدرالمتألهین با بیش از ۱۵ سال سابقه پژوهش و تدریس متون مرجع حکمی.';

  const t = {
    heading: dict.course_instructor_heading || 'استاد و مدرس کرسی درس',
    stat_courses: dict.course_instructor_stat_courses || '۳۳ دوره تدریس تخصصی',
    stat_experience: dict.course_instructor_stat_experience || 'بیش از ۱۵ سال تدریس خارج',
    stat_books: dict.course_instructor_stat_books || 'تالیف ۵ عنوان کتاب مرجع',
    btn_courses: dict.course_instructor_courses_btn || 'مشاهده تمام آثار و دروس استاد',
  };

  return (
    <section
      aria-label="کارت معرفی استاد"
      className={`bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-start ${className}`}
    >
      <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1D8] dark:border-[#24262D]">
        <GraduationCap className="w-5 h-5 text-[#8A532B] dark:text-[#C58B43]" />
        <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {t.heading}
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="relative shrink-0">
          <img
            src="/images/ostad_zanjirzan.jpg"
            alt={scholarName}
            className="w-20 h-20 rounded-full object-cover border-2 border-[#8A532B]/50 dark:border-[#C58B43]/60 shadow-md p-0.5"
          />
        </div>

        <div className="space-y-1 min-w-0">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {scholarName}
          </h3>
          <p className="text-xs font-mono text-[#8A532B] dark:text-[#C58B43]">
            {scholarTitle}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1 text-justify">
            {bio}
          </p>
        </div>
      </div>

      {/* 3 Pillars / Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#1C1E22] border border-zinc-200 dark:border-zinc-800 space-y-1">
          <Layers className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
          <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {t.stat_courses}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#1C1E22] border border-zinc-200 dark:border-zinc-800 space-y-1">
          <Calendar className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
          <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {t.stat_experience}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#1C1E22] border border-zinc-200 dark:border-zinc-800 space-y-1">
          <BookOpen className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
          <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {t.stat_books}
          </span>
        </div>
      </div>

      {/* Action Link */}
      <div className="pt-2">
        <Link
          href="/courses"
          onClick={() => triggerTactileHaptic('tick')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8A532B] dark:text-[#C58B43] hover:underline cursor-pointer"
        >
          <span>{t.btn_courses}</span>
          {currentLang === 'en' ? (
            <ArrowRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowLeft className="w-3.5 h-3.5" />
          )}
        </Link>
      </div>
    </section>
  );
}
