'use client';

import React from 'react';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Radio,
  BookOpen,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { CourseCategory, AudioCourse, toLocaleDigits } from '@/lib/data';
import { useLanguage } from '@/context/LanguageContext';
import { triggerTactileHaptic } from '@/lib/haptics';

interface CourseCatalogMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CourseCategory[];
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  selectedType: 'all' | 'offline' | 'online';
  onSelectType: (type: 'all' | 'offline' | 'online') => void;
  onlyFree: boolean;
  onToggleOnlyFree: (val: boolean) => void;
  sortBy: string;
  onSelectSortBy: (sort: string) => void;
  courses: AudioCourse[];
  filteredCount: number;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const CourseCatalogMobileFilterDrawer: React.FC<
  CourseCatalogMobileFilterDrawerProps
> = ({
  isOpen,
  onClose,
  categories,
  selectedSubject,
  onSelectSubject,
  selectedType,
  onSelectType,
  onlyFree,
  onToggleOnlyFree,
  sortBy,
  onSelectSortBy,
  courses,
  filteredCount,
  onClearFilters,
  hasActiveFilters,
}) => {
  const { currentLang, dict } = useLanguage();

  const t = {
    mobile_title: dict.catalog_filter_mobile_title || 'فیلترهای پیشرفته کاتالوگ',
    disciplines_title: dict.catalog_filter_disciplines_title || 'شاخه‌های علمی',
    delivery_title: dict.catalog_filter_delivery_type_title || 'نوع برگزاری',
    access_title: dict.catalog_filter_access_title || 'دسترسی و شهریه',
    free_only: dict.catalog_filter_free_only || 'فقط دوره‌های رایگان',
    clear_all: dict.catalog_filter_clear_all || 'پاک‌سازی فیلترها',
    apply: dict.catalog_filter_mobile_apply || 'اعمال فیلترها',
    show: dict.catalog_filter_show_courses || 'مشاهده',
    all_disciplines: dict.catalog_type_all || 'همه شاخه‌ها',
    type_all: dict.catalog_type_all || 'همه دوره‌ها',
    type_offline: dict.catalog_type_offline || 'آفلاین',
    type_online: dict.catalog_type_online || 'آنلاین',
    sort_title: dict.catalog_sort_label || 'مرتب‌سازی:',
    sort_default: dict.catalog_sort_default || 'همه',
    sort_newest: dict.catalog_sort_newest || 'جدیدترین',
    sort_popular: dict.catalog_sort_popular || 'محبوب‌ترین',
    sort_price_asc: dict.catalog_sort_price_asc || 'کمترین شهریه',
    sort_price_desc: dict.catalog_sort_price_desc || 'بیشترین شهریه',
    courses_suffix: dict.catalog_total_courses_count || 'عنوان درس‌گفتار تخصصی',
  };

  const getCategoryCount = (catName: string) => {
    return courses.filter((c) => {
      return (
        c.subject === catName ||
        categories.some(
          (cat) =>
            cat.name === c.subject &&
            (cat.name === catName || cat.name_en === catName || cat.name_ar === catName || cat.slug === catName)
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
                { id: 'popular', label: t.sort_popular },
                { id: 'price_desc', label: t.sort_price_desc },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    triggerTactileHaptic('tick');
                    onSelectSortBy(opt.id);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs text-start transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer flex items-center justify-between ${
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

          {/* 2. Course Delivery Type */}
          <div className="space-y-2 pt-2 border-t border-[#E6E1D8] dark:border-[#24262D]">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
              {t.delivery_title}
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-[#1C1E22] rounded-xl text-center text-xs">
              <button
                onClick={() => {
                  triggerTactileHaptic('tick');
                  onSelectType('all');
                }}
                className={`py-2 rounded-lg transition-all duration-200 ease-out active:scale-[0.97] font-medium cursor-pointer ${
                  selectedType === 'all'
                    ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {t.type_all}
              </button>
              <button
                onClick={() => {
                  triggerTactileHaptic('tick');
                  onSelectType('offline');
                }}
                className={`py-2 rounded-lg transition-all duration-200 ease-out active:scale-[0.97] font-medium cursor-pointer ${
                  selectedType === 'offline'
                    ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <BookOpen className="w-3 h-3 inline me-1" />
                {t.type_offline}
              </button>
              <button
                onClick={() => {
                  triggerTactileHaptic('tick');
                  onSelectType('online');
                }}
                className={`py-2 rounded-lg transition-all duration-200 ease-out active:scale-[0.97] font-medium cursor-pointer ${
                  selectedType === 'online'
                    ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Radio className="w-3 h-3 inline me-1" />
                {t.type_online}
              </button>
            </div>
          </div>

          {/* 3. Free Only Toggle Switch */}
          <div className="pt-2 border-t border-[#E6E1D8] dark:border-[#24262D]">
            <label className="flex items-center justify-between cursor-pointer group py-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {t.free_only}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={onlyFree}
                aria-label={t.free_only || 'دوره‌های رایگان'}
                title={t.free_only || 'دوره‌های رایگان'}
                onClick={() => {
                  triggerTactileHaptic('tick');
                  onToggleOnlyFree(!onlyFree);
                }}
                className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                  onlyFree
                    ? 'bg-[#8A532B] dark:bg-[#C58B43]'
                    : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    onlyFree ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* 4. Disciplines List */}
          <div className="space-y-2 pt-2 border-t border-[#E6E1D8] dark:border-[#24262D]">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
              {t.disciplines_title}
            </span>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pe-1">
              {/* All */}
              <button
                onClick={() => {
                  triggerTactileHaptic('tick');
                  onSelectSubject('all');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                  selectedSubject === 'all'
                    ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] font-bold border border-[#8A532B]/20 dark:border-[#C58B43]/30'
                    : 'bg-white dark:bg-[#18191D] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <span>{t.all_disciplines}</span>
                <span className="text-[10px] font-mono opacity-60">
                  ({toLocaleDigits(courses.length, currentLang)})
                </span>
              </button>

              {/* Dynamic Categories */}
              {categories.map((cat) => {
                const isSelected = selectedSubject === cat.name;
                const count = getCategoryCount(cat.name);
                let label = cat.name;
                if (currentLang === 'en' && cat.name_en) label = cat.name_en;
                if (currentLang === 'ar' && cat.name_ar) label = cat.name_ar;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      triggerTactileHaptic('tick');
                      onSelectSubject(cat.name);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] font-bold border border-[#8A532B]/20 dark:border-[#C58B43]/30'
                        : 'bg-white dark:bg-[#18191D] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-[10px] font-mono opacity-60">
                      ({toLocaleDigits(count, currentLang)})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-[#E6E1D8] dark:border-[#24262D] bg-white dark:bg-[#18191D] flex items-center gap-3 shrink-0">
          {hasActiveFilters && (
            <button
              onClick={() => {
                triggerTactileHaptic('tick');
                onClearFilters();
              }}
              className="py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center gap-1.5 cursor-pointer shrink-0"
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
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#8A532B] hover:bg-[#724423] dark:bg-[#C58B43] dark:hover:bg-[#B37932] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.apply}</span>
            <span className="text-[11px] opacity-90 font-mono">
              ({toLocaleDigits(filteredCount, currentLang)} {t.show})
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
