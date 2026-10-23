'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export interface BarChartDataPoint {
  id: string;
  label: string;
  value: number;
  formattedValue?: string;
  sublabel?: string;
}

export interface MinimalistBarChartProps {
  title: string;
  subtitle?: string;
  data: BarChartDataPoint[];
  timeRanges?: { id: string; label: string }[];
  activeTimeRange?: string;
  onTimeRangeChange?: (rangeId: string) => void;
  metricUnit?: string;
  className?: string;
}

/**
 * Minimal vertical bar chart (Dribbble shot #2): faint guides, rounded-top bars,
 * and a dark floating tooltip with a caret. Bars are focusable so the tooltip
 * is reachable by keyboard, not only by pointer.
 */
export function MinimalistBarChart({
  title,
  subtitle,
  data,
  timeRanges,
  activeTimeRange,
  onTimeRangeChange,
  metricUnit,
  className = '',
}: MinimalistBarChartProps) {
  const { toLocale } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      className={`space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 text-start dark:border-zinc-800 dark:bg-[#141518] ${className}`}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
          {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>

        {timeRanges && timeRanges.length > 0 && (
          <div role="tablist" className="flex items-center gap-4 self-start border-b border-zinc-200 dark:border-zinc-800 sm:self-auto">
            {timeRanges.map((range) => {
              const isActive = activeTimeRange === range.id;
              return (
                <button
                  key={range.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTimeRangeChange?.(range.id)}
                  className={`-mb-px cursor-pointer border-b-2 pb-2 text-xs transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A532B] ${
                    isActive
                      ? 'border-[#8A532B] font-bold text-zinc-900 dark:border-[#C58B43] dark:text-zinc-100'
                      : 'border-transparent text-zinc-500 dark:text-zinc-400 [@media(hover:hover)]:hover:text-zinc-900 dark:[@media(hover:hover)]:hover:text-zinc-100'
                  }`}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative pt-8" onMouseLeave={() => setActiveIndex(null)}>
        {/* Guides */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 top-8 flex flex-col justify-between">
          <div className="border-b border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="border-b border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="border-b border-dashed border-zinc-200 dark:border-zinc-800" />
          <div className="border-b border-zinc-200 dark:border-zinc-800" />
        </div>

        <div className="relative z-10 flex h-48 items-end justify-between gap-2 px-2 sm:gap-4 sm:px-4">
          {data.map((item, index) => {
            const heightPercent = Math.max(Math.round((item.value / maxValue) * 100), 5);
            const isActive = activeIndex === index;
            const valueText = item.formattedValue || `${toLocale(item.value)} ${metricUnit || ''}`.trim();

            return (
              <button
                key={item.id}
                type="button"
                aria-label={`${item.label}: ${valueText}${item.sublabel ? ` (${item.sublabel})` : ''}`}
                className="group relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end focus-visible:outline-none"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
              >
                {/* Dark floating tooltip + caret; opacity/transform only */}
                <span
                  role="tooltip"
                  style={{ bottom: `calc(${heightPercent}% * 0.88 + 2rem)` }}
                  className={`pointer-events-none absolute start-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#0C0D0E] px-3 py-2 text-center text-white shadow-md transition-opacity duration-150 ease-out rtl:translate-x-1/2 dark:bg-zinc-100 dark:text-zinc-900 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <span className="block font-num text-xs font-bold">{valueText}</span>
                  {item.sublabel && (
                    <span className="block text-[11px] text-zinc-300 dark:text-zinc-600">{item.sublabel}</span>
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute start-1/2 top-full h-2 w-2 -translate-y-1 -translate-x-1/2 rotate-45 bg-[#0C0D0E] rtl:translate-x-1/2 dark:bg-zinc-100"
                  />
                </span>

                <span className="flex h-full w-full items-end justify-center">
                  <span
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-9 rounded-t-md transition-colors duration-150 ease-out ${
                      isActive ? 'bg-[#724424] dark:bg-[#DB9B4F]' : 'bg-[#8A532B] dark:bg-[#C58B43]'
                    }`}
                  />
                </span>

                <span className="mt-2 block w-full truncate text-center font-num text-xs text-zinc-500 dark:text-zinc-400">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
