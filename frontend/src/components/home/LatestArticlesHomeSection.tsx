'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Clock, Calendar, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { getLocalizedArticle } from '@/lib/localization';
import { scholarlyArticlesDatabase } from '@/lib/data';
import { SCHOLAR_NAME } from '@/lib/constants';

export function LatestArticlesHomeSection() {
  const { dict, currentLang, localizeHref, toLocale } = useLanguage();
  const { articles: contextArticles } = useData();

  // Use live context articles or fallback to rich scholarly database
  const articlesList =
    contextArticles && contextArticles.length > 0
      ? contextArticles
      : scholarlyArticlesDatabase;

  const topArticles = articlesList.slice(0, 4);
  const leadArticle = topArticles[0];
  const secondaryArticles = topArticles.slice(1, 4);

  const locLead = leadArticle ? getLocalizedArticle(leadArticle, currentLang) : null;

  return (
    <section
      aria-label={dict.articles_section_title || 'آخرین مقالات و رساله‌های علمی'}
      className="max-w-6xl mx-auto px-4 sm:px-6 w-full text-start"
    >
      {/* 1. Scholarly Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#E6E1D8] dark:border-[#22242A]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#E6CA85] text-xs font-bold border border-[#8A532B]/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{dict.articles_home_badge || 'پژوهش‌های آکادمیک و رساله‌ها'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
            {dict.articles_home_title || 'آخرین مقالات و جستارهای برهانی'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {dict.articles_home_desc ||
              `مجموعه مقالات تخصصی و آثار تحلیلی تبیین‌شده توسط ${dict.scholar_name || SCHOLAR_NAME} در تراز آکادمیک و حوزوی.`}
          </p>
        </div>

        <Link
          href={localizeHref('/articles')}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E6E1D8] dark:border-[#22242A] hover:border-[#8A532B] text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors shrink-0 shadow-2xs group"
        >
          <span>{dict.articles_view_all || 'مشاهده تمام مقالات'}</span>
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* 2. Editorial Bento Grid: 1 Featured Lead + 3 Stacked Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Lead Featured Article (7 Cols) */}
        {leadArticle && locLead && (
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] hover:border-[#8A532B]/60 dark:hover:border-[#C58B43]/60 transition-all shadow-xs group">
            <div className="space-y-4">
              {/* Category & Meta */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#E6CA85] font-bold">
                  {locLead.category}
                </span>
                <div className="flex items-center gap-3 text-zinc-500 font-num tabular-nums text-[11px] sm:text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{toLocale(locLead.readTime)}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{toLocale(locLead.publishDate)}</span>
                  </span>
                </div>
              </div>

              {/* Title */}
              <Link href={localizeHref(`/articles/${locLead.slug}`)} className="block">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5] group-hover:text-[#8A532B] dark:group-hover:text-[#E6CA85] transition-colors leading-snug">
                  {locLead.title}
                </h3>
              </Link>

              {/* Abstract */}
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-4">
                {locLead.abstract}
              </p>
            </div>

            {/* Footer with Scholar Badge & Read Link */}
            <div className="pt-6 mt-6 border-t border-[#E6E1D8]/80 dark:border-[#22242A] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#8A532B]/15 dark:bg-[#C58B43]/20 flex items-center justify-center text-[#8A532B] dark:text-[#E6CA85] shrink-0 font-bold text-xs">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {dict.scholar_name || SCHOLAR_NAME}
                </span>
              </div>

              <Link
                href={localizeHref(`/articles/${locLead.slug}`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold transition shadow-2xs group/btn cursor-pointer"
              >
                <span>{dict.articles_btn_read || 'مطالعه رساله'}</span>
                <ArrowLeft className="w-3 h-3 rtl:rotate-0 ltr:rotate-180 group-hover/btn:-translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        )}

        {/* Secondary Articles Column (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
          {secondaryArticles.map((art) => {
            const loc = getLocalizedArticle(art, currentLang);
            if (!loc) return null;

            return (
              <div
                key={art.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] hover:border-[#8A532B]/50 dark:hover:border-[#C58B43]/50 transition-all shadow-xs group flex flex-col justify-between flex-1 space-y-2.5"
              >
                {/* Meta Row */}
                <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500 font-num">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                    {loc.category}
                  </span>
                  <span className="flex items-center gap-1 tabular-nums">
                    <Clock className="w-3 h-3" />
                    <span>{toLocale(loc.readTime)}</span>
                  </span>
                </div>

                {/* Title */}
                <Link href={localizeHref(`/articles/${loc.slug}`)} className="block">
                  <h4 className="text-xs sm:text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5] group-hover:text-[#8A532B] dark:group-hover:text-[#E6CA85] transition-colors line-clamp-2 leading-relaxed">
                    {loc.title}
                  </h4>
                </Link>

                {/* Abstract Excerpt */}
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {loc.abstract}
                </p>

                {/* Read Link */}
                <div className="pt-2 flex justify-end">
                  <Link
                    href={localizeHref(`/articles/${loc.slug}`)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A532B] dark:text-[#E6CA85] hover:underline"
                  >
                    <span>{dict.articles_btn_read || 'مطالعه'}</span>
                    <ArrowLeft className="w-3 h-3 rtl:rotate-0 ltr:rotate-180" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile-Only Bottom Link */}
      <div className="mt-6 text-center sm:hidden">
        <Link
          href={localizeHref('/articles')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E6E1D8] dark:border-[#22242A] text-xs font-bold text-zinc-800 dark:text-zinc-200"
        >
          <span>{dict.articles_view_all || 'مشاهده تمام مقالات'}</span>
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
        </Link>
      </div>
    </section>
  );
}

export default LatestArticlesHomeSection;