'use client';

import React from 'react';
import { GraduationCap, Zap } from 'lucide-react';

interface QuickRoleSelectorProps {
  onSelectRole: (phone: string, password: string, role: 'student') => void;
  disabled?: boolean;
}

export function QuickRoleSelector({ onSelectRole, disabled = false }: QuickRoleSelectorProps) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'false') {
    return null;
  }

  return (
    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3 text-start">
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
        <Zap className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
        <span>ورود آزمایشی سریع (ارزیابی عملکرد سامانه):</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectRole('09123456789', 'pass', 'student')}
          className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 hover:border-[#8A532B] dark:hover:border-[#C58B43] text-start transition group cursor-pointer disabled:opacity-60"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] group-hover:scale-105 transition" />
            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
              دانشجو
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            ۰۹۱۲۳۴۵۶۷۸۹
          </span>
        </button>
      </div>
    </div>
  );
}
