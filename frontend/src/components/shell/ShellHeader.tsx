'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  ShieldCheck,
  User,
  Globe,
  Check,
  ChevronDown,
  Home,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { SupportedLang } from '@/lib/data';

export interface ShellHeaderProps {
  portalType: 'student' | 'admin';
  portalBadge?: string;
  activeTabTitle: string;
  userName?: string;
  userRole?: string;
  onOpenMobileNav?: () => void;
}

import { getScholarName } from '@/lib/constants';

const languages: { code: SupportedLang; label: string; dir: 'rtl' | 'ltr' }[] = [
  { code: 'fa', label: 'فارسی', dir: 'rtl' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
];

export function ShellHeader({
  portalType,
  portalBadge,
  activeTabTitle,
  userName,
  userRole,
  onOpenMobileNav,
}: ShellHeaderProps) {
  const { dict, currentLang, setLanguage, localizeHref } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultRole = portalType === 'admin'
    ? (dict.ui_administrator)
    : (dict.ui_student);

  const defaultUserName = userName || (
    portalType === 'admin'
      ? (currentLang === 'en' ? 'Academic Council' : 'هیئت علمی حیات')
      : (currentLang === 'en' ? 'Philosophy Student' : 'دانش‌پژوه حکمت')
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

      {/* Right (RTL End) Group: Scholar Credit, Language Switcher, Profile */}
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

        {/* Language Switcher Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition cursor-pointer text-xs font-mono"
            aria-expanded={isLangOpen}
            aria-label={dict.nav_language}
          >
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span>{currentLang.toUpperCase()}</span>
            <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangOpen && (
            <div className="absolute end-0 mt-2 w-36 bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg p-2 z-50 text-start">
              {languages.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] font-bold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

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
