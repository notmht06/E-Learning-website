'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Search,
  Moon,
  Sun,
  ShoppingBag,
  GraduationCap,
  LogIn,
  Menu,
  X,
  Globe,
  Compass,
  Headphones,
  Scroll,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { useData } from '@/context/DataContext';
import { SCHOLAR_NAME, PLATFORM_NAME, getScholarName } from '@/lib/constants';
import { SupportedLang } from '@/locales';
import { NavbarCoursesMegaMenu } from './NavbarCoursesMegaMenu';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui';

interface FloatingNavigationPillProps {
  onOpenCart?: () => void;
  cartCount?: number;
}

export const FloatingNavigationPill: React.FC<FloatingNavigationPillProps> = ({
  onOpenCart,
  cartCount: propCartCount,
}) => {
  const { isAuthenticated, isAdmin, user, isLoading: isAuthLoading } = useAuth();
  const { currentLang, setLanguage, dict, isRtl, toLocale, localizeHref } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { items: cartItems, openCart } = useCart();
  const { categories, courses } = useData();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaTab, setActiveMegaTab] = useState<'offline' | 'online'>('offline');

  const headerRef = useRef<HTMLElement | null>(null);
  const megaTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsMobileOpen(false);
        setIsMegaMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
        setIsMegaMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    };
  }, []);

  const totalCartCount = propCartCount !== undefined ? propCartCount : cartItems.length;

  const handleOpenSearch = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-command-palette'));
    }
  };

  const handleCartClick = () => {
    if (onOpenCart) {
      onOpenCart();
    } else {
      openCart();
    }
  };

  const handleMouseEnterCourses = () => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeaveCourses = () => {
    megaTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 400);
  };

  const languages: { code: SupportedLang; label: string; flag: string }[] = [
    { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <header
      ref={headerRef}
      className="sticky top-3 sm:top-5 z-40 mx-auto w-[calc(100%-1rem)] sm:w-[calc(100%-1.5rem)] max-w-7xl transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-300 relative"
    >
      <div className="rounded-full bg-[#FAF8F5]/90 dark:bg-[#121316]/90 backdrop-blur-xl border border-[#E6E1D8] dark:border-[#22242A] shadow-lg shadow-black/5 px-3.5 sm:px-5 py-2 flex items-center justify-between gap-2.5 xl:gap-3 2xl:gap-5 flex-nowrap shrink-0 overflow-visible">
        {/* Brand Identity / Scholar */}
        <Link
          href={localizeHref('/')}
          className="flex items-center gap-2.5 sm:gap-3 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A532B] rounded-full pe-1 whitespace-nowrap"
          title={dict.nav_home}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#8A532B] text-white flex items-center justify-center shadow-xs transition-transform duration-200 shrink-0">
            <BookOpen className="w-4 h-4 text-[#FAF8F5] shrink-0" />
          </div>
          <div className="flex flex-col text-start leading-tight min-w-0 shrink-0 whitespace-nowrap">
            <span className="text-[11px] sm:text-[11px] font-bold text-[#8A532B] dark:text-[#C58B43] tracking-normal font-sans whitespace-nowrap block">
              {dict.brand_sub}
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5] whitespace-nowrap block">
              {dict.scholar_name || SCHOLAR_NAME}
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Links (Previous titles + Swiss capsule design) */}
        <nav
          aria-label="Desktop Navigation Links"
          className="hidden xl:flex items-center gap-1 xl:gap-1.5 2xl:gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 flex-nowrap shrink-0 whitespace-nowrap"
        >
          {/* 1. Home */}
          <Link
            href={localizeHref('/')}
            className="inline-flex items-center justify-center h-8 px-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#8A532B] dark:hover:text-[#C58B43] transition-colors whitespace-nowrap shrink-0"
          >
            {dict.nav_home}
          </Link>

          {/* 2. Courses with Mega-Menu Trigger */}
          <div
            className="relative shrink-0 flex items-center h-8 whitespace-nowrap"
            onMouseEnter={handleMouseEnterCourses}
            onMouseLeave={handleMouseLeaveCourses}
          >
            <Link
              href={localizeHref('/courses')}
              className={`inline-flex items-center justify-center h-8 px-3 rounded-full transition-colors gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                isMegaMenuOpen
                  ? 'bg-black/5 dark:bg-white/5 text-[#8A532B] dark:text-[#C58B43] font-bold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#8A532B] dark:hover:text-[#C58B43]'
              }`}
            >
              <span className="whitespace-nowrap">{dict.nav_courses}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                  isMegaMenuOpen ? 'rotate-180 text-[#8A532B] dark:text-[#C58B43]' : ''
                }`}
              />
            </Link>
          </div>

          {/* 3. Curriculum Roadmap */}
          <Link
            href={localizeHref('/roadmap')}
            className="inline-flex items-center justify-center h-8 px-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#8A532B] dark:hover:text-[#C58B43] transition-colors gap-1.5 whitespace-nowrap shrink-0"
          >
            <Compass className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
            <span className="whitespace-nowrap">{dict.nav_roadmap}</span>
          </Link>


          {/* 5. Scholarly Articles */}
          <Link
            href={localizeHref('/articles')}
            className="inline-flex items-center justify-center h-8 px-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#8A532B] dark:hover:text-[#C58B43] transition-colors whitespace-nowrap shrink-0"
          >
            <span className="whitespace-nowrap">{dict.nav_articles}</span>
          </Link>
        </nav>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={handleOpenSearch}
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label={dict.nav_search_aria}
            title={dict.nav_search_aria}
          >
            <Search className="w-4 h-4 shrink-0" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label={dict.pill_nav_theme_aria}
            title={dict.pill_nav_theme_aria}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#C58B43] shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-[#8A532B] shrink-0" />
            )}
          </button>

          {/* Elegant Dropdown Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:text-[#8A532B] dark:hover:text-[#C58B43] hover:border-[#8A532B]/30 transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 cursor-pointer shrink-0"
                aria-label={dict.nav_language}
                title={dict.nav_language}
              >
                <Globe className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span className="text-[11px] font-bold">
                  {dict.ui_english}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-36 p-1.5 bg-[#FAF8F5] dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#27282D] rounded-2xl shadow-xl space-y-0.5 z-50 text-xs"
            >
              <DropdownMenuItem
                onClick={() => setLanguage('fa')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-bold transition-colors ${
                  currentLang === 'fa'
                    ? 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/15 dark:text-[#C58B43]'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>فارسی</span>
                <span className="text-[11px] font-mono opacity-60">FA</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('ar')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-bold transition-colors ${
                  currentLang === 'ar'
                    ? 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/15 dark:text-[#C58B43]'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>العربية</span>
                <span className="text-[11px] font-mono opacity-60">AR</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-bold transition-colors font-sans ${
                  currentLang === 'en'
                    ? 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/15 dark:text-[#C58B43]'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>English</span>
                <span className="text-[11px] font-mono opacity-60">EN</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            onClick={handleCartClick}
            className="relative p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label={dict.nav_bag}
            title={dict.nav_bag}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            {totalCartCount > 0 && (
              <span className="absolute top-0.5 end-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#8A532B] text-white text-[11px] font-bold flex items-center justify-center leading-none font-num">
                {toLocale(totalCartCount)}
              </span>
            )}
          </button>

          {/* Student Auth Portal Link with Skeleton Pulse */}
          {isAuthLoading ? (
            <div className="hidden sm:block w-24 h-8 rounded-full bg-black/5 dark:bg-white/5 animate-pulse shrink-0" />
          ) : isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              {isAdmin && (
                <Link
                  href={localizeHref('/admin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8A532B]/10 hover:bg-[#8A532B]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                  title={dict.nav_admin}
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{dict.nav_admin}</span>
                </Link>
              )}
              <Link
                href={localizeHref('/dashboard')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8A532B]/10 hover:bg-[#8A532B]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                title={dict.nav_dashboard}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{dict.nav_dashboard}</span>
              </Link>
            </div>
          ) : (
            <Link
              href={localizeHref('/login')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap shrink-0"
              title={dict.pill_nav_portal || dict.nav_login}
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{dict.pill_nav_portal || dict.nav_login}</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="xl:hidden p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 cursor-pointer shrink-0 active:scale-90"
            aria-label={dict.pill_nav_menu_toggle}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav-drawer"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isMobileOpen ? 'open' : 'closed'}
                initial={{ opacity: 0, rotate: isMobileOpen ? -90 : 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: isMobileOpen ? 90 : -90 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="block"
              >
                {isMobileOpen ? <X className="w-4 h-4 shrink-0" /> : <Menu className="w-4 h-4 shrink-0" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Desktop Courses Mega-Menu (Centered below pill) */}
      <NavbarCoursesMegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
        activeTab={activeMegaTab}
        onTabChange={setActiveMegaTab}
        categories={categories}
        courses={courses}
        currentLang={currentLang}
        dict={dict}
        toLocale={toLocale}
        localizeHref={localizeHref}
        onMouseEnter={handleMouseEnterCourses}
        onMouseLeave={handleMouseLeaveCourses}
      />

      {/* Mobile Drawer Dropdown with Fluid Hardware-Accelerated Motion */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            id="mobile-nav-drawer"
            key="mobile-nav-drawer"
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="xl:hidden mt-2 mx-1 p-4 rounded-3xl bg-[#FAF8F5]/95 dark:bg-[#121316]/95 backdrop-blur-2xl border border-[#E6E1D8] dark:border-[#22242A] shadow-xl space-y-3 origin-top overflow-hidden"
          >
          {/* Quick Search Button in Mobile Drawer */}
          <button
            type="button"
            onClick={() => {
              setIsMobileOpen(false);
              handleOpenSearch();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-500 hover:border-[#8A532B]/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#8A532B] shrink-0" />
              <span>{dict.nav_search_aria}</span>
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link
              href={localizeHref('/')}
              onClick={() => setIsMobileOpen(false)}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2 hover:border-[#8A532B]/40 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#8A532B] shrink-0" />
              <span>{dict.nav_home}</span>
            </Link>
            <Link
              href={localizeHref('/courses')}
              onClick={() => setIsMobileOpen(false)}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2 hover:border-[#8A532B]/40 transition-colors"
            >
              <Headphones className="w-4 h-4 text-[#8A532B] shrink-0" />
              <span>{dict.nav_courses}</span>
            </Link>
            <Link
              href={localizeHref('/roadmap')}
              onClick={() => setIsMobileOpen(false)}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2 hover:border-[#8A532B]/40 transition-colors"
            >
              <Compass className="w-4 h-4 text-[#8A532B] shrink-0" />
              <span>{dict.nav_roadmap}</span>
            </Link>
            <Link
              href={localizeHref('/articles')}
              onClick={() => setIsMobileOpen(false)}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2 hover:border-[#8A532B]/40 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#8A532B] shrink-0" />
              <span>{dict.nav_articles}</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            {isAuthLoading ? (
              <div className="w-full h-10 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    href={localizeHref('/admin')}
                    onClick={() => setIsMobileOpen(false)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center gap-2 font-bold text-xs"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{dict.nav_admin}</span>
                  </Link>
                )}
                <Link
                  href={localizeHref('/dashboard')}
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center gap-2 font-bold text-xs"
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>{dict.nav_dashboard}</span>
                </Link>
              </>
            ) : (
              <Link
                href={localizeHref('/login')}
                onClick={() => setIsMobileOpen(false)}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#8A532B] text-white flex items-center justify-center gap-2 font-bold text-xs shadow-xs"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>{dict.pill_nav_portal || dict.nav_login}</span>
              </Link>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
};
