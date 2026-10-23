'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatSquircleProps {
  value: string | number;
  label: string;
  sublabel?: string;
  className?: string;
  accent?: boolean;
}

export function StatSquircle({ value, label, sublabel, className, accent = false }: StatSquircleProps) {
  return (
    <div
      className={cn(
        'aspect-square rounded-[2rem] sm:rounded-[2.5rem] border flex flex-col items-center justify-center p-4 text-center transition duration-200 hover:scale-[1.03] select-none shadow-2xs group',
        accent
          ? 'bg-[#8A532B]/10 dark:bg-[#C58B43]/15 border-[#8A532B]/30 dark:border-[#C58B43]/30 text-[#8A532B] dark:text-[#C58B43]'
          : 'bg-white dark:bg-[#141518] border-stone-200/90 dark:border-neutral-800 text-stone-900 dark:text-stone-100',
        className
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-1">
        <span className="font-num font-bold text-2xl sm:text-2xl lg:text-2xl tracking-tight transition-transform duration-200 group-hover:scale-105">
          {value}
        </span>
        <span className="text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-300 line-clamp-1 max-w-full px-1">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-num line-clamp-1 max-w-full px-1">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
