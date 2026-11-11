'use client';

import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
} from 'lucide-react';
import { CourseCategory, ScholarlyArticle, toLocaleDigits } from '@/lib/data';
import { useLanguage } from '@/context/LanguageContext';
import { triggerTactileHaptic } from '@/lib/haptics';

interface ArticleCatalogSidebarProps {
  categories: CourseCategory[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  articles: ScholarlyArticle[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

export const ArticleCatalogSidebar: React.FC<ArticleCatalogSidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  articles,
  onClearFilters,
  hasActiveFilters,
  className = '',
}) => {
  const { currentLang, dict } = useLanguage();

  const t = {
    disciplines_title: dict.catalog_filter_disciplines_title || 'شاخه‌های علمی',
    clear_all: dict.catalog_filter_clear_all || 'پاک کردن فیلترها',
    all_disciplines: dict.catalog_filter_all_categories || dict.ui_all_treatises || 'همه موضوعات',
  };

  const getCategoryCount = (catName: string) => {
    return articles.filter((art) => {
      return (
        art.category === catName ||
        art.category_fa === catName ||
        categories.some(
          (cat) =>
            (cat.name === art.category || cat.name_fa === art.category || cat.slug === art.category) &&
            (cat.name === catName || cat.name_fa === catName || cat.name_en === catName || cat.name_ar === catName || cat.slug === catName)
        )
      );
    }).length;
  };

  return (
    <aside
      className={`w-full bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] rounded-2xl p-5 space-y-6 shadow-xs text-start ${className}`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8] dark:border-[#24262D]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {t.disciplines_title}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              triggerTactileHaptic('tick');
              onClearFilters();
            }}
            className="flex items-center gap-1 text-[11px] font-mono text-[#8A532B] dark:text-[#C58B43] hover:underline cursor-pointer transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.clear_all}</span>
          </button>
        )}
      </div>

      {/* Disciplines List (شاخه‌های علمی) */}
      <div role="tablist" aria-label={t.disciplines_title} className="space-y-2">
        {/* All Subjects Item */}
        <button
          role="tab"
          aria-selected={selectedCategory === 'all'}
          onClick={() => {
            triggerTactileHaptic('tick');
            onSelectCategory('all');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 ease-out active:scale-[0.98] cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] font-bold border border-[#8A532B]/20 dark:border-[#C58B43]/30 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                selectedCategory === 'all'
                  ? 'border-[#8A532B] dark:border-[#C58B43] bg-[#8A532B] dark:bg-[#C58B43] text-white'
                  : 'border-zinc-300 dark:border-zinc-700'
              }`}
            >
              {selectedCategory === 'all' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
            </span>
            <span>{t.all_disciplines}</span>
          </div>
          <span className="text-[11px] font-mono opacity-60 tabular-nums">
            ({toLocaleDigits(articles.length, currentLang)})
          </span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const catId = cat.name_fa || cat.name;
          const isSelected = selectedCategory === catId || selectedCategory === cat.name || selectedCategory === cat.slug;
          const count = getCategoryCount(catId);
          let label = cat.name_fa || cat.name;
          if (currentLang === 'en' && cat.name_en) label = cat.name_en;
          if (currentLang === 'ar' && cat.name_ar) label = cat.name_ar;

          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                triggerTactileHaptic('tick');
                onSelectCategory(catId);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 ease-out active:scale-[0.98] cursor-pointer ${
                isSelected
                  ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] font-bold border border-[#8A532B]/20 dark:border-[#C58B43]/30 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'border-[#8A532B] dark:border-[#C58B43] bg-[#8A532B] dark:bg-[#C58B43] text-white'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                </span>
                <span className="truncate">{label}</span>
              </div>
              <span className="text-[11px] font-mono opacity-60 shrink-0 tabular-nums">
                ({toLocaleDigits(count, currentLang)})
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
