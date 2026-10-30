'use client';

import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  Radio,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { CourseCategory, AudioCourse, toLocaleDigits } from '@/lib/data';
import { useLanguage } from '@/context/LanguageContext';
import { triggerTactileHaptic } from '@/lib/haptics';

interface CourseCatalogSidebarProps {
  categories: CourseCategory[];
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  selectedType: 'all' | 'offline' | 'online';
  onSelectType: (type: 'all' | 'offline' | 'online') => void;
  onlyFree: boolean;
  onToggleOnlyFree: (val: boolean) => void;
  courses: AudioCourse[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

export const CourseCatalogSidebar: React.FC<CourseCatalogSidebarProps> = ({
  categories,
  selectedSubject,
  onSelectSubject,
  selectedType,
  onSelectType,
  onlyFree,
  onToggleOnlyFree,
  courses,
  onClearFilters,
  hasActiveFilters,
  className = '',
}) => {
  const { currentLang, dict } = useLanguage();

  // Translations
  const t = {
    disciplines_title: dict.catalog_filter_disciplines_title || 'شاخه‌های علمی',
    delivery_title: dict.catalog_filter_delivery_type_title || 'نوع برگزاری',
    access_title: dict.catalog_filter_access_title || 'دسترسی و شهریه',
    free_only: dict.catalog_filter_free_only || 'فقط دوره‌های رایگان',
    clear_all: dict.catalog_filter_clear_all || 'پاک‌سازی فیلترها',
    all_disciplines: dict.catalog_type_all || 'همه شاخه‌ها',
    type_all: dict.catalog_type_all || 'همه دوره‌ها',
    type_offline: dict.catalog_type_offline || 'آفلاین',
    type_online: dict.catalog_type_online || 'آنلاین',
  };

  // Compute category counts
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

      {/* 1. Disciplines List (شاخه‌های علمی) */}
      <div className="space-y-2">
        {/* All Subjects Item */}
        <button
          onClick={() => {
            triggerTactileHaptic('tick');
            onSelectSubject('all');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer ${
            selectedSubject === 'all'
              ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] font-bold border border-[#8A532B]/20 dark:border-[#C58B43]/30 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                selectedSubject === 'all'
                  ? 'border-[#8A532B] dark:border-[#C58B43] bg-[#8A532B] dark:bg-[#C58B43] text-white'
                  : 'border-zinc-300 dark:border-zinc-700'
              }`}
            >
              {selectedSubject === 'all' && <Check className="w-2.5 h-2.5 text-white" />}
            </span>
            <span>{t.all_disciplines}</span>
          </div>
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer ${
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
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                </span>
                <span className="truncate">{label}</span>
              </div>
              <span className="text-[10px] font-mono opacity-60 shrink-0">
                ({toLocaleDigits(count, currentLang)})
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Course Delivery Type (نوع برگزاری) */}
      <div className="pt-4 border-t border-[#E6E1D8] dark:border-[#24262D] space-y-2">
        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
          {t.delivery_title}
        </span>
        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-[#1C1E22] rounded-xl text-center text-xs">
          <button
            onClick={() => {
              triggerTactileHaptic('tick');
              onSelectType('all');
            }}
            className={`py-1.5 rounded-lg transition-all duration-200 ease-out font-medium cursor-pointer active:scale-[0.97] ${
              selectedType === 'all'
                ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {t.type_all}
          </button>
          <button
            onClick={() => {
              triggerTactileHaptic('tick');
              onSelectType('offline');
            }}
            className={`py-1.5 rounded-lg transition-all duration-200 ease-out font-medium cursor-pointer active:scale-[0.97] ${
              selectedType === 'offline'
                ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
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
            className={`py-1.5 rounded-lg transition-all duration-200 ease-out font-medium cursor-pointer active:scale-[0.97] ${
              selectedType === 'online'
                ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Radio className="w-3 h-3 inline me-1" />
            {t.type_online}
          </button>
        </div>
      </div>

      {/* 3. Tuition & Access Status (شهریه و دسترسی) */}
      <div className="pt-4 border-t border-[#E6E1D8] dark:border-[#24262D] space-y-3">
        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
          {t.access_title}
        </span>

        {/* Free Only Toggle Switch */}
        <label className="flex items-center justify-between cursor-pointer group select-none">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
            <span className="text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition">
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
            className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
              onlyFree
                ? 'bg-[#8A532B] dark:bg-[#C58B43]'
                : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                onlyFree ? 'ltr:translate-x-4 rtl:-translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </label>
      </div>
    </aside>
  );
};
