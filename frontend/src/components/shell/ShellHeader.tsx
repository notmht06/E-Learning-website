'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu,
  ShieldCheck,
  User,
  Home,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getScholarName } from '@/lib/constants';

export interface ShellHeaderProps {
  portalType: 'student' | 'admin';
  portalBadge?: string;
  activeTabTitle: string;
  userName?: string;
  userRole?: string;
  onOpenMobileNav?: () => void;
}

export function ShellHeader({
  portalType,
  portalBadge,
  activeTabTitle,
  userName,
  userRole,
  onOpenMobileNav,
}: ShellHeaderProps) {
  const { dict, currentLang, localizeHref } = useLanguage();

  const defaultRole = portalType === 'admin'
    ? (dict.ui_administrator)
    : (dict.ui_student);

  const defaultUserName = userName || (
    portalType === 'admin'
      ? (currentLang === 'en' ? 'Academic Council' : 'هیئت علمی حیات')
      : (currentLang === 'en' ? 'Philosophy Student' : 'دانشجوی حکمت')
  );

  return (
    <header className="h-16 bg-white dark:bg-[#141518] border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 select-none transition-colors">
      {/* Left (RTL Start) Group: Mobile Hamburger + Breadcrumb Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="lg:hidden w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50 truncate tracking-tight">
            {activeTabTitle}
          </h1>

          {portalBadge && (
            <span className="hidden md:inline-block px-3 py-0.5 rounded-full text-[11px] font-mono bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 shrink-0">
              {portalBadge}
            </span>
          )}
        </div>
      </div>

      {/* Right (RTL End) Group: Scholar Credit, Main Site Link, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
        {/* Scholar Identity Guarantee */}
        <div className="hidden xl:flex items-center gap-2 text-zinc-500 pe-2">
          <ShieldCheck className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
          <span className="font-medium text-zinc-800 dark:text-zinc-200 text-xs">
            {getScholarName(currentLang)}
          </span>
        </div>

        {/* Quick Link to Main Website */}
        <Link
          href={localizeHref('/')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition text-xs font-medium"
          title={dict.ui_main_website}
        >
          <Home className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
          <span className="hidden sm:inline">
            {dict.ui_main_site}
          </span>
        </Link>

        {/* User Profile Trigger */}
        <div className="flex items-center gap-2 ps-2 sm:ps-3 border-s border-zinc-200 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center font-bold shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-start leading-tight">
            <span className="text-zinc-800 dark:text-zinc-200 font-medium block truncate max-w-[130px]">
              {defaultUserName}
            </span>
            <span className="text-[11px] text-zinc-400 block font-mono">
              {userRole || defaultRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
