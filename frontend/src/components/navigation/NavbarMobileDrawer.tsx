'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  GraduationCap,
  LogIn,
  Headphones,
  ChevronDown,
  Compass,
  Sun,
  Moon,
} from 'lucide-react';
import { CourseCategory, SupportedLang } from '@/lib/data';
import { getLocalizedCategory } from '@/lib/localization';

interface NavbarMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  currentLang: SupportedLang;
  onLanguageChange: (lang: SupportedLang) => void;
  isDark?: boolean;
  onThemeToggle?: () => void;
  categories: CourseCategory[];
  dict: Record<string, string>;
}

export const NavbarMobileDrawer: React.FC<NavbarMobileDrawerProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  currentLang,
  onLanguageChange,
  isDark = false,
  onThemeToggle,
  categories,
  dict,
}) => {
  const [mobileAccordion, setMobileAccordion] = useState<string | null>('courses');

  if (!isOpen) return null;

  return (
    <div className="xl:hidden border-t border-book-border dark:border-stone-800 bg-white dark:bg-[#18191D] p-4 space-y-4 animate-in slide-in-from-top-2">
      {/* Mobile Search & User Account Row */}
      <div className="flex sm:hidden items-center gap-2 pb-2 border-b border-book-border dark:border-stone-800">
        <button
          type="button"
          onClick={() => {
            onClose();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-command-palette'));
            }
          }}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] text-xs font-bold text-book-subtext hover:text-book-text"
        >
          <Search className="w-4 h-4 text-[#8A532B]" />
          <span>{dict.nav_search_aria || 'جستجوی مباحث و دوره‌ها...'}</span>
        </button>
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-[#8A532B] text-white text-xs font-bold flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            <span>{dict.nav_dashboard}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-[#8A532B] text-white text-xs font-bold flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{dict.nav_login}</span>
          </Link>
        )}
      </div>

      <div className="space-y-1">
        <Link
          href="/"
          onClick={onClose}
          className="block px-3 py-2 rounded-xl text-sm font-bold text-book-text dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
        >
          {dict.nav_home}
        </Link>

        {/* Courses Accordion */}
        <div>
          <button
            onClick={() => setMobileAccordion(mobileAccordion === 'courses' ? null : 'courses')}
            className="w-full px-3 py-2 rounded-xl text-sm font-bold text-book-text dark:text-white hover:bg-black/[0.03] flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-book-accent" />
              <span>{dict.nav_mobile_courses_topics || 'دوره‌ها و موضوعات'}</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                mobileAccordion === 'courses' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {mobileAccordion === 'courses' && (
            <div className="ps-4 pe-2 pt-2 space-y-2 border-s-2 border-book-accent/30 ms-4 mt-1">
              <Link
                href="/courses"
                onClick={onClose}
                className="block text-xs font-bold text-book-accent py-1"
              >
                {dict.nav_mobile_all_courses || '• مشاهده تمام دوره‌ها'}
              </Link>
              <span className="text-[11px] font-bold text-book-subtext block pt-1">
                {dict.nav_mobile_specialized_topics || 'موضوعات تخصصی:'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => {
                  const locC = getLocalizedCategory(c, currentLang);
                  return (
                    <Link
                      key={c.id}
                      href={`/courses?subject=${encodeURIComponent(c.name)}`}
                      onClick={onClose}
                      className="text-xs text-book-text dark:text-stone-300 py-1 px-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] block"
                    >
                      {locC?.name || c.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Link
          href="/roadmap"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-book-text dark:text-white hover:bg-black/[0.03]"
        >
          <Compass className="w-4 h-4 text-book-accent" />
          <span>{dict.nav_mobile_roadmap || 'سیر مطالعاتی (نقشه راه)'}</span>
        </Link>

        <Link
          href="/articles"
          onClick={onClose}
          className="block px-3 py-2 rounded-xl text-sm font-bold text-book-text dark:text-white hover:bg-black/[0.03]"
        >
          {dict.nav_mobile_articles || 'مقالات و تقریرات علمی'}
        </Link>

        <Link
          href="/books"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold text-book-text dark:text-white hover:bg-black/[0.03]"
        >
          <span>{dict.nav_mobile_books || 'کتب و تالیفات'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8A532B]/15 text-[#8A532B] dark:text-[#C58B43]">
            {dict.badge_soon || 'به‌زودی'}
          </span>
        </Link>

        {/* Mobile Language and Theme Controls */}
        <div className="pt-2 border-t border-book-border dark:border-stone-800 flex items-center justify-between px-3">
          <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-full text-xs font-bold">
            <button
              onClick={() => onLanguageChange('fa')}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                currentLang === 'fa' ? 'bg-[#8A532B] text-white shadow-xs' : 'text-stone-500'
              }`}
            >
              فارسی
            </button>
            <button
              onClick={() => onLanguageChange('ar')}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                currentLang === 'ar' ? 'bg-[#8A532B] text-white shadow-xs' : 'text-stone-500'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                currentLang === 'en' ? 'bg-[#8A532B] text-white shadow-xs' : 'text-stone-500'
              }`}
            >
              EN
            </button>
          </div>
          {onThemeToggle && (
            <button
              onClick={onThemeToggle}
              className="w-9 h-9 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-book-border dark:border-book-darkBorder flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer"
              title={dict.theme_toggle}
            >
              {isDark ? <Sun className="w-4 h-4 text-[#8A532B]" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>

        <div className="pt-2 border-t border-book-border dark:border-stone-800 space-y-2">
          <span className="text-xs font-bold text-book-subtext block px-3">
            {dict.nav_mobile_support || 'پل ارتباطی و پشتیبانی:'}
          </span>
          <div className="flex items-center gap-2 px-3">
            <a
              href="https://t.me/Hekkmat7"
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-2 rounded-lg bg-[#8A532B]/10 text-[#8A532B] font-bold"
            >
              تلگرام (@Hekkmat7)
            </a>
            <a
              href="https://eitaa.com/Hekkmat7"
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-2 rounded-lg bg-[#8A532B]/10 text-[#8A532B] font-bold"
            >
              ایتا (@Hekkmat7)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
