'use client';

import React from 'react';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  ArrowUpDown,
  Clock,
  BookOpen,
  FileText,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { CourseCategory, ScholarlyArticle, toLocaleDigits } from '@/lib/data';
import { useLanguage } from '@/context/LanguageContext';
import { triggerTactileHaptic } from '@/lib/haptics';

interface ArticleCatalogMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CourseCategory[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sortBy: string;
  onSelectSortBy: (sort: string) => void;
  articles: ScholarlyArticle[];
  selectedReadTime?: 'all' | 'short' | 'deep';
  onSelectReadTime?: (val: 'all' | 'short' | 'deep') => void;
  onlyQuickAbstract?: boolean;
  onToggleOnlyQuickAbstract?: (val: boolean) => void;
  filteredCount: number;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const ArticleCatalogMobileFilterDrawer: React.FC<
  ArticleCatalogMobileFilterDrawerProps
> = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSelectSortBy,
  articles,
  selectedReadTime = 'all',
  onSelectReadTime,
  onlyQuickAbstract = false,
  onToggleOnlyQuickAbstract,
  filteredCount,
  onClearFilters,
  hasActiveFilters,
}) => {
  const { currentLang, dict } = useLanguage();

  const t = {
    mobile_title: dict.catalog_filter_mobile_title || 'فیلترهای مقالات',
    disciplines_title: dict.catalog_filter_disciplines_title || 'شاخه‌های علمی',
    readtime_title: 'زمان و عمق مطالعه',
    readtime_all: 'همه مقالات',
    readtime_short: 'کوتاه (زیر ۱۵ دقیقه)',
    readtime_deep: 'عمیق (+۱۵ دقیقه)',
    access_title: 'دسترسی و چکیده',
    quick_abstract_only: 'فقط مقالات دارای چکیده سریع',
    clear_all: dict.catalog_filter_clear_all || 'پاک کردن فیلترها',
    apply: dict.catalog_filter_mobile_apply || 'اعمال فیلترها',
    show: dict.catalog_filter_show_courses || 'نمایش',
    all_disciplines: dict.catalog_filter_all_categories || dict.ui_all_treatises || 'همه موضوعات',
    sort_title: dict.catalog_sort_label || 'مرتب‌سازی:',
    sort_default: dict.catalog_sort_default || 'همه',
    sort_newest: dict.catalog_sort_newest || 'جدیدترین',
    articles_suffix: dict.articles_count_label || 'مقاله',
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="fixed inset-x-0 bottom-0 top-auto z-50 max-h-[88vh] w-full max-w-xl mx-auto rounded-t-3xl rounded-b-none border-t border-x border-b-0 border-[#E6E1D8] dark:border-[#24262D] bg-[#FAF8F5] dark:bg-[#141518] p-0 shadow-2xl flex flex-col translate-y-0 [&>button:last-child]:hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E1D8] dark:border-[#24262D] shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
            <DialogTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {t.mobile_title}
            </DialogTitle>
          </div>

          <button
            onClick={() => {
              triggerTactileHaptic('tick');
              onClose();
            }}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-start">
          {/* 1. Sort Order */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
              <span>{t.sort_title}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'default', label: t.sort_default },
                { id: 'newest', label: t.sort_newest },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    triggerTactileHaptic('tick');
                    onSelectSortBy(opt.id);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs text-start transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 ease-out active:scale-[0.98] cursor-pointer flex items-center justify-between ${
                    sortBy === opt.id
                      ? 'bg-[#8A532B] text-white font-bold dark:bg-[#C58B43]'
                      : 'bg-white dark:bg-[#1C1E22] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Disciplines List */}
          <div className="space-y-2 pt-2 border-t border-[#E6E1D8] dark:border-[#24262D]">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
              {t.disciplines_title}
            </span>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pe-1">
              {/* All */}
              <button
                onClick={() => {
                  triggerTactileHaptic('tick');
                  onSelectCategory('all');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] font-bold border border-[#8A532B]/20 dark:border-[#C58B43]/30'
                    : 'bg-white dark:bg-[#18191D] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <span>{t.all_disciplines}</span>
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
                    onClick={() => {
                      triggerTactileHaptic('tick');
                      onSelectCategory(catId);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] font-bold border border-[#8A532B]/20 dark:border-[#C58B43]/30'
                        : 'bg-white dark:bg-[#18191D] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-[11px] font-mono opacity-60 tabular-nums">
                      ({toLocaleDigits(count, currentLang)})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Reading Time (زمان مطالعه) */}
          {onSelectReadTime && (
            <div className="space-y-2 pt-2 border-t border-[#E6E1D8] dark:border-[#24262D]">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                {t.readtime_title}
              </span>
              <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-[#1C1E22] rounded-xl text-center text-xs">
                <button
                  type="button"
                  onClick={() => {
                    triggerTactileHaptic('tick');
                    onSelectReadTime('all');
                  }}
                  className={`py-1.5 rounded-lg transition font-medium cursor-pointer ${
                    selectedReadTime === 'all'
                      ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {t.readtime_all}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerTactileHaptic('tick');
                    onSelectReadTime('short');
                  }}
                  className={`py-1.5 rounded-lg transition font-medium cursor-pointer ${
                    selectedReadTime === 'short'
                      ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <Clock className="w-3 h-3 inline me-1" />
                  {t.readtime_short}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerTactileHaptic('tick');
                    onSelectReadTime('deep');
                  }}
                  className={`py-1.5 rounded-lg transition font-medium cursor-pointer ${
                    selectedReadTime === 'deep'
                      ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <BookOpen className="w-3 h-3 inline me-1" />
                  {t.readtime_deep}
                </button>
              </div>
            </div>
          )}

          {/* 4. Quick Abstract Toggle (دسترسی و چکیده) */}
          {onToggleOnlyQuickAbstract && (
            <div className="space-y-3 pt-2 border-t border-[#E6E1D8] dark:border-[#24262D]">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                {t.access_title}
              </span>
              <label className="flex items-center justify-between cursor-pointer group select-none">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                  <span className="text-xs text-zinc-700 dark:text-zinc-300">
                    {t.quick_abstract_only}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={onlyQuickAbstract}
                  onClick={() => {
                    triggerTactileHaptic('tick');
                    onToggleOnlyQuickAbstract(!onlyQuickAbstract);
                  }}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                    onlyQuickAbstract
                      ? 'bg-[#8A532B] dark:bg-[#C58B43]'
                      : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      onlyQuickAbstract ? 'ltr:translate-x-4 rtl:-translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-[#E6E1D8] dark:border-[#24262D] bg-white dark:bg-[#18191D] flex items-center gap-3 shrink-0">
          {hasActiveFilters && (
            <button
              onClick={() => {
                triggerTactileHaptic('tick');
                onClearFilters();
              }}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.clear_all}</span>
            </button>
          )}

          <button
            onClick={() => {
              triggerTactileHaptic('tick');
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] dark:bg-[#C58B43] dark:hover:bg-[#b07936] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{t.show}</span>
            <span className="font-mono tabular-nums">({toLocaleDigits(filteredCount, currentLang)})</span>
            <span>{t.articles_suffix}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
