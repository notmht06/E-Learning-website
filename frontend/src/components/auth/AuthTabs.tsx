'use client';

import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { AuthTab } from '@/hooks/useAuthForm';

interface AuthTabsProps {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  loginLabel?: string;
  registerLabel?: string;
}

export function AuthTabs({
  activeTab,
  onTabChange,
  loginLabel = 'ورود به حساب',
  registerLabel = 'ثبت‌نام',
}: AuthTabsProps) {
  return (
    <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/80">
      <button
        type="button"
        onClick={() => onTabChange('login')}
        className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
          activeTab === 'login'
            ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
        }`}
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>{loginLabel}</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('register')}
        className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
          activeTab === 'register'
            ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
        }`}
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>{registerLabel}</span>
      </button>
    </div>
  );
}
