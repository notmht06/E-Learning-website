'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export interface KpiMetricItem {
  id: string;
  serial: string;              // e.g. '[ ۰۱ ]'
  title: string;               // e.g. 'دوره‌های فعال'
  value: string | number;      // e.g. '۲ دوره' or 2
  sublabel?: string;           // e.g. 'شرح اسفار و منطق'
  icon: React.ElementType;     // Lucide icon component
  colorClass?: string;         // Soft circular wrapper classes
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export interface KpiMetricStripProps {
  metrics: KpiMetricItem[];
  className?: string;
}

export function KpiMetricStrip({ metrics, className = '' }: KpiMetricStripProps) {
  const { toLocale } = useLanguage();

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-start ${className}`}>
      {metrics.map((item) => {
        const Icon = item.icon;
        const defaultColor = 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/40 dark:text-[#C58B43]';
        const circleColor = item.colorClass || defaultColor;

        const displayValue = typeof item.value === 'number'
          ? toLocale(item.value)
          : item.value;

        return (
          <div
            key={item.id}
            className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-3 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
          >
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 block font-num tracking-wide">
                {item.serial} {item.title}
              </span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-num tabular-nums tracking-tight block">
                {displayValue}
              </span>
              {item.sublabel && (
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block truncate">
                  {item.sublabel}
                </span>
              )}
              {item.trend && (
                <span
                  className={`inline-flex items-center text-[10px] font-mono font-medium rounded-md px-2 py-0.5 mt-1 ${
                    item.trend.isPositive
                      ? 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/30 dark:text-[#C58B43]'
                      : 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/30 dark:text-[#C58B43]'
                  }`}
                >
                  {item.trend.value}
                </span>
              )}
            </div>

            {/* Soft-colored circular icon wrapper (strictly rounded-full) */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${circleColor}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
