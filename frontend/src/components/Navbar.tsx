'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Headphones,
  Compass,
  Search,
  Moon,
  Sun,
  ShoppingBag,
  ShieldAlert,
  GraduationCap,
  LogIn,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { SupportedLang } from '@/lib/data';
import { SCHOLAR_NAME } from '@/lib/constants';
import { NavbarCoursesMegaMenu, NavbarMobileDrawer } from './navigation';

interface NavbarProps {
  currentLang?: SupportedLang;
  isDark?: boolean;
  cartCount?: number;
  onLanguageChange?: (lang: SupportedLang) => void;
  onThemeToggle?: () => void;
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang: propLang,
  isDark: propIsDark,
  cartCount = 0,
  onLanguageChange,
  onThemeToggle,
  onOpenCart,
}) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { currentLang: ctxLang, setLanguage, dict, toLocale } = useLanguage();
  const { theme, isDark: ctxDark, toggleTheme } = useTheme();
  const { categories, courses } = useData();
  const currentLang = propLang || ctxLang;
  const isDark = propIsDark !== undefined ? propIsDark : ctxDark;

  const handleThemeToggle = () => {
    toggleTheme();
    if (onThemeToggle) {
      onThemeToggle();
    }
  };

  // Mega-menu and Mobile Drawer state
  const [isCoursesMenuOpen, setIsCoursesMenuOpen] = useState(false);
  const [activeMegaTab, setActiveMegaTab] = useState<'offline' | 'online'>('offline');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterCourses = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setIsCoursesMenuOpen(true);
  };

  const handleMouseLeaveCourses = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsCoursesMenuOpen(false);
    }, 200);
  };

  const handleLangSelect = (lang: SupportedLang) => {
    setLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 dark:bg-[#121316]/90 backdrop-blur-xl border-b border-[#EAE6DF] dark:border-[#27282D] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-20 flex items-center justify-between gap-2 xl:gap-3">
        {/* Left / Brand Identity: Scholar Logo & Official Title */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 group cursor-pointer min-w-0 flex-1 sm:flex-initial shrink-0"
          title={dict.nav_home}
        >
          <div className="w-10 h-10 rounded-xl bg-[#8C6834] text-white flex items-center justify-center shadow-md shadow-black/10 group-hover:scale-105 transition duration-200 shrink-0">
            <BookOpen className="w-5 h-5 text-[#FFF8EB]" />
          </div>
          <div className="text-start whitespace-nowrap min-w-0">
            <span className="text-[10px] font-bold tracking-wider uppercase text-book-accent dark:text-[#C58B43] hidden sm:block leading-tight">
              {dict.brand_sub || 'پایگاه یادگیری حکمت'}
            </span>
            <span className="text-xs sm:text-sm md:text-base font-bold text-book-text dark:text-white font-bookTitle tracking-tight leading-tight truncate block">
              {dict.scholar_name || SCHOLAR_NAME}
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1 xl:gap-2 text-xs font-bold text-book-subtext dark:text-book-darkSubtext whitespace-nowrap">
          {/* 1. Home */}
          <Link
            href="/"
            className="px-3 xl:px-3 py-2 rounded-xl whitespace-nowrap shrink-0 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-book-text dark:hover:text-white transition duration-200"
          >
            {dict.nav_home}
          </Link>

          {/* 2. Courses Mega-Menu Trigger */}
          <div
            className="relative shrink-0"
            onMouseEnter={handleMouseEnterCourses}
            onMouseLeave={handleMouseLeaveCourses}
          >
            <button
              onClick={() => setIsCoursesMenuOpen(!isCoursesMenuOpen)}
              className={`px-3 xl:px-3 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0 transition duration-200 cursor-pointer ${
                isCoursesMenuOpen
                  ? 'bg-book-accent/10 text-book-accent dark:text-[#C58B43]'
                  : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-book-text dark:hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{dict.nav_courses || 'دوره‌ها'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                  isCoursesMenuOpen ? 'rotate-180 text-book-accent' : ''
                }`}
              />
            </button>

            {/* Mega-Menu Dropdown Panel */}
            <NavbarCoursesMegaMenu
              isOpen={isCoursesMenuOpen}
              onClose={() => setIsCoursesMenuOpen(false)}
              activeTab={activeMegaTab}
              onTabChange={setActiveMegaTab}
              categories={categories}
              courses={courses}
              currentLang={currentLang}
              dict={dict}
              toLocale={toLocale}
            />
          </div>

          {/* 3. Curriculum Roadmap */}
          <Link
            href="/roadmap"
            className="px-3 xl:px-3 py-2 rounded-xl whitespace-nowrap shrink-0 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-book-text dark:hover:text-white transition duration-200 flex items-center gap-2"
          >
            <Compass className="w-3.5 h-3.5 text-book-accent shrink-0" />
            <span className="whitespace-nowrap">{dict.nav_roadmap || 'سیر مطالعاتی'}</span>
          </Link>

          {/* 4. Scholarly Articles */}
          <Link
            href="/articles"
            className="px-3 xl:px-3 py-2 rounded-xl whitespace-nowrap shrink-0 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-book-text dark:hover:text-white transition duration-200"
          >
            <span className="whitespace-nowrap">{dict.nav_articles || 'مقالات علمی'}</span>
          </Link>

          {/* 5. Books */}
          <Link
            href="/books"
            className="px-3 xl:px-3 py-2 rounded-xl whitespace-nowrap shrink-0 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-book-text dark:hover:text-white transition duration-200 flex items-center gap-2"
          >
            <span className="whitespace-nowrap">{dict.nav_books}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#8A532B]/15 text-[#8A532B] dark:text-[#C58B43] font-bold border border-[#8A532B]/30 whitespace-nowrap shrink-0">
              {dict.badge_soon || 'به‌زودی'}
            </span>
          </Link>
        </nav>

        {/* Right: Search, Portal/Dashboard, Lang Switcher, Theme & Cart */}
        <div className="flex items-center gap-2 sm:gap-2 xl:gap-3 shrink-0">
          {/* Quick Search Trigger (Icon Only) */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open-command-palette'));
              }
            }}
            className="hidden sm:flex w-9 h-9 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-book-border dark:border-book-darkBorder items-center justify-center text-book-subtext hover:text-book-text dark:hover:text-white hover:border-book-accent/40 hover:scale-105 transition cursor-pointer shrink-0"
            title={dict.nav_quick_search_tooltip || 'جستجوی سریع (Ctrl+K)'}
            aria-label={dict.nav_search_aria || 'جستجو'}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* User Account / Dashboard Link */}
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 2xl:px-3 py-2 rounded-full bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/30 dark:border-[#C58B43]/30 text-xs font-bold hover:bg-[#724424] hover:text-white transition whitespace-nowrap shrink-0"
                  title={dict.nav_admin}
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden 2xl:inline whitespace-nowrap">{dict.nav_admin}</span>
                </Link>
              )}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 2xl:px-3 py-2 rounded-full bg-book-accentLight dark:bg-stone-800 text-book-accent dark:text-[#C58B43] text-xs font-bold hover:bg-book-accent hover:text-white transition shadow-xs whitespace-nowrap shrink-0"
                title={dict.nav_dashboard}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span className="hidden 2xl:inline whitespace-nowrap">{dict.nav_dashboard}</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 px-3 sm:px-3 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-book-text dark:text-white text-xs font-bold hover:bg-book-accent hover:text-white transition whitespace-nowrap shrink-0"
              title={dict.nav_login}
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">{dict.nav_login}</span>
            </Link>
          )}

          {/* Segmented Control for Languages */}
          <div className="hidden 2xl:flex items-center p-0.5 sm:p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full border border-book-border dark:border-book-darkBorder text-[11px] font-bold shrink-0">
            <button
              onClick={() => handleLangSelect('fa')}
              className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full transition cursor-pointer ${
                currentLang === 'fa'
                  ? 'bg-[#8A532B] text-white shadow-xs'
                  : 'text-book-subtext hover:text-book-text dark:hover:text-white'
              }`}
            >
              فا
            </button>
            <button
              onClick={() => handleLangSelect('ar')}
              className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full transition cursor-pointer ${
                currentLang === 'ar'
                  ? 'bg-[#8A532B] text-white shadow-xs'
                  : 'text-book-subtext hover:text-book-text dark:hover:text-white'
              }`}
            >
              عر
            </button>
            <button
              onClick={() => handleLangSelect('en')}
              className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full transition cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-[#8A532B] text-white shadow-xs'
                  : 'text-book-subtext hover:text-book-text dark:hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={handleThemeToggle}
            className="hidden sm:flex w-9 h-9 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-book-border dark:border-book-darkBorder items-center justify-center text-book-subtext hover:text-book-text dark:hover:text-white hover:scale-105 transition cursor-pointer shrink-0"
            title={dict.theme_toggle || 'تغییر پوسته'}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Shopping Bag Button */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-[#8A532B] hover:bg-[#724424] text-white px-3 sm:px-3 py-2 sm:py-2 rounded-full text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer shrink-0"
              title={dict.nav_bag}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-[#8A532B] text-[10px] sm:text-[11px] font-bold flex items-center justify-center font-num">
                {toLocale(cartCount)}
              </span>
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden w-9 h-9 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-book-border dark:border-book-darkBorder flex items-center justify-center text-book-subtext hover:text-book-text transition shrink-0"
            aria-label="منوی ناوبری"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <NavbarMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        currentLang={currentLang}
        onLanguageChange={handleLangSelect}
        isDark={isDark}
        onThemeToggle={handleThemeToggle}
        categories={categories}
        dict={dict}
      />
    </header>
  );
};
