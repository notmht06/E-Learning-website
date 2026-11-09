'use client';

import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

interface DashboardHeaderProps {
  activeTabTitle: string;
  userName?: string;
}

export function DashboardHeader({ activeTabTitle, userName }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-[#141518] border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
          {activeTabTitle}
        </h1>
        <span className="hidden sm:inline-block px-3 py-0.5 rounded-full text-[11px] font-mono bg-[#8A532B]/10 text-[#8A532B] border border-[#8A532B]/20">
          حیات علوم عقلی
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="hidden md:flex items-center gap-2 text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-[#8A532B]" />
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            حجت الاسلام دکتر زنجیرزن حسینی
          </span>
        </div>

        <div className="flex items-center gap-2 ps-3 border-s border-zinc-200 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-[#8A532B]/10 text-[#8A532B] flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">
            {userName || 'دانشجوی حکمت'}
          </span>
        </div>
      </div>
    </header>
  );
}
