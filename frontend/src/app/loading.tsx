import React from 'react';
import { BookOpen } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0D0E] flex flex-col items-center justify-center p-6 select-none">
      <div className="max-w-sm w-full bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-6 text-center space-y-4 shadow-2xs">
        <div className="w-11 h-11 rounded-xl bg-[#8A532B] text-[#FAF8F5] flex items-center justify-center mx-auto shadow-xs">
          <BookOpen className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-[#8A532B] dark:text-[#C58B43] block">
            [ HAYAT ARCHIVE ]
          </span>
          <p className="text-xs font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
            در حال فراخوانی متون و درسگفتارها...
          </p>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#EFECE6] dark:bg-[#1C1E22] overflow-hidden">
          <div className="w-1/2 h-full rounded-full bg-[#8A532B] dark:bg-[#C58B43] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
