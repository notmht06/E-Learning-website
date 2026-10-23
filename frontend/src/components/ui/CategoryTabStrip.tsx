'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface CategoryTabStripProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

/** Text-only underline tabs with "(03)" style counts, per the Dribbble catalog reference. */
export function CategoryTabStrip({
  tabs,
  activeTab,
  onChange,
  className,
  ariaLabel = 'دسته‌بندی‌ها',
}: CategoryTabStripProps) {
  const { toLocale } = useLanguage();

  const pad = (n: number) => toLocale(String(n).padStart(2, '0'));

  return (
    <nav
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'flex items-center gap-6 overflow-x-auto border-b border-zinc-200 text-sm select-none scrollbar-none dark:border-zinc-800',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              '-mb-px flex cursor-pointer items-center gap-1 whitespace-nowrap border-b-2 pb-3 pt-1 transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A532B]',
              isActive
                ? 'border-[#8A532B] font-bold text-zinc-900 dark:border-[#C58B43] dark:text-zinc-100'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 [@media(hover:hover)]:hover:text-zinc-900 dark:[@media(hover:hover)]:hover:text-zinc-100'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && <span className="font-num text-xs">({pad(tab.count)})</span>}
          </button>
        );
      })}
    </nav>
  );
}
