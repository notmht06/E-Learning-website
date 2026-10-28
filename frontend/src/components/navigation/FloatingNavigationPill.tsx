'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { SCHOLAR_NAME, PLATFORM_NAME, getScholarName } from '@/lib/constants';
import { SupportedLang } from '@/locales';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
} from '@/components/ui';

interface FloatingNavigationPillProps {
  onOpenCart?: () => void;
  cartCount?: number;
}

export const FloatingNavigationPill: React.FC<FloatingNavigationPillProps> = ({
  onOpenCart,
  cartCount: propCartCount,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { currentLang, setLanguage, dict, isRtl, toLocale } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { items: cartItems, openCart } = useCart();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsMobileOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
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

  const languages: { code: SupportedLang; label: string; flag: string }[] = [
    { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <header
      ref={headerRef}
      className="sticky top-3 sm:top-5 z-40 mx-auto w-[calc(100%-1.25rem)] sm:w-[calc(100%-2.5rem)] max-w-5xl transition-all duration-300"
    >
      <div className="rounded-full bg-[#FAF8F5]/90 dark:bg-[#121316]/90 backdrop-blur-xl border border-[#E6E1D8] dark:border-[#22242A] shadow-lg shadow-black/5 px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Identity / Scholar */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A532B] rounded-full pe-1"
          title={dict.scholar_name || getScholarName(currentLang)}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#8A532B] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
            <BookOpen className="w-4 h-4 text-[#FAF8F5]" />
          </div>
          <div className="flex flex-col text-start leading-tight min-w-0">
            <span className="text-[10px] sm:text-xs font-bold text-[#8A532B] dark:text-[#C58B43] tracking-normal font-sans">
              {dict.pill_nav_brand || PLATFORM_NAME}
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5] truncate max-w-[130px] sm:max-w-[220px] md:max-w-[280px]">
              {dict.scholar_name || getScholarName(currentLang)}
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav
          aria-label="Navigation Links"
          className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300"
        >
          <Link
            href="/courses"
            className="px-2.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#8A532B] dark:hover:text-[#C58B43] transition-colors"
          >
            {dict.pill_nav_catalog || 'دوره‌ها'}
          </Link>
          <a
            href="/#stations"
            className="px-2.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#8A532B] dark:hover:text-[#C58B43] transition-colors flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5 text-[#8A532B]" />
            <span>{dict.pill_nav_stations || 'ایستگاه‌های حکمت'}</span>
          </a>
          <a
            href="/#discourse"
            className="px-2.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#8A532B] dark:hover:text-[#C58B43] transition-colors flex items-center gap-1"
          >
            <Headphones className="w-3.5 h-3.5 text-[#8A532B]" />
            <span>{dict.pill_nav_discourse || 'گفتار و استودیو'}</span>
          </a>
          <Link
            href="/books"
            className="px-2.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#8A532B] dark:hover:text-[#C58B43] transition-colors"
          >
            {dict.pill_nav_books || 'کتب و آثار'}
          </Link>
          <Link
            href="/roadmap"
            className="px-2.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#8A532B] dark:hover:text-[#C58B43] transition-colors hidden lg:block"
          >
            {dict.pill_nav_roadmap || 'سیر مطالعاتی'}
          </Link>
          <Link
            href="/articles"
            className="px-2.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#8A532B] dark:hover:text-[#C58B43] transition-colors hidden lg:block"
          >
            {dict.pill_nav_articles || 'مقالات'}
          </Link>
        </nav>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={handleOpenSearch}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
            aria-label={dict.pill_nav_search_aria || 'جستجو'}
            title="Ctrl + K"
          >
            <Search className="w-4 h-4" />
            <span className="hidden xl:inline text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
              Ctrl+K
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={dict.pill_nav_theme_aria || 'تغییر پوسته'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#C58B43]" />
            ) : (
              <Moon className="w-4 h-4 text-[#8A532B]" />
            )}
          </button>

          {/* Language Selector Dropdown with shadcn DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 cursor-pointer"
                aria-label={dict.pill_nav_lang_aria || 'انتخاب زبان'}
              >
                <Globe className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase hidden sm:inline">
                  {currentLang}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {languages.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`flex items-center justify-between text-xs ${
                    currentLang === l.code ? 'font-bold text-[#8A532B] dark:text-[#C58B43]' : ''
                  }`}
                >
                  <span>{l.label}</span>
                  <span className="text-sm">{l.flag}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            onClick={handleCartClick}
            className="relative p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={dict.pill_nav_cart_aria || 'سبد خرید'}
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute top-0.5 end-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#8A532B] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {toLocale(totalCartCount)}
              </span>
            )}
          </button>

          {/* Student Auth Portal Link */}
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8A532B]/10 hover:bg-[#8A532B]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 text-xs font-bold transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{dict.pill_nav_dashboard || 'پورتال دانشجو'}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{dict.pill_nav_portal || 'ورود'}</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={dict.pill_nav_menu_toggle || 'منو'}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav-drawer"
          >
            {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isMobileOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden mt-2 mx-1 p-4 rounded-3xl bg-[#FAF8F5]/95 dark:bg-[#121316]/95 backdrop-blur-2xl border border-[#E6E1D8] dark:border-[#22242A] shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link
              href="/courses"
              onClick={() => setIsMobileOpen(false)}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2 hover:border-[#8A532B]/40 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#8A532B]" />
              <span>{dict.pill_nav_catalog || 'دوره‌ها'}</span>
            </Link>
            <a
              href="/#stations"
              onClick={() => setIsMobileOpen(false)}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2 hover:border-[#8A532B]/40 transition-colors"
            >
              <Compass className="w-4 h-4 text-[#8A532B]" />
              <span>{dict.pill_nav_stations || 'ایستگاه‌های حکمت'}</span>
            </a>
            <a
              href="/#discourse"
              onClick={() => setIsMobileOpen(false)}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2 hover:border-[#8A532B]/40 transition-colors"
            >
              <Headphones className="w-4 h-4 text-[#8A532B]" />
              <span>{dict.pill_nav_discourse || 'گفتار و استودیو'}</span>
            </a>
            <Link
              href="/books"
              onClick={() => setIsMobileOpen(false)}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2 hover:border-[#8A532B]/40 transition-colors"
            >
              <Scroll className="w-4 h-4 text-[#8A532B]" />
              <span>{dict.pill_nav_books || 'کتب و آثار'}</span>
            </Link>
            <Link
              href="/roadmap"
              onClick={() => setIsMobileOpen(false)}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2 hover:border-[#8A532B]/40 transition-colors"
            >
              <Compass className="w-4 h-4 text-[#8A532B]" />
              <span>{dict.pill_nav_roadmap || 'سیر مطالعاتی'}</span>
            </Link>
            <Link
              href="/articles"
              onClick={() => setIsMobileOpen(false)}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#18191D] border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2 hover:border-[#8A532B]/40 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#8A532B]" />
              <span>{dict.pill_nav_articles || 'مقالات'}</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setIsMobileOpen(false)}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center gap-2 font-bold text-xs"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{dict.pill_nav_dashboard || 'پورتال دانشجو'}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileOpen(false)}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#8A532B] text-white flex items-center justify-center gap-2 font-bold text-xs shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>{dict.pill_nav_portal || 'ورود به سامانه'}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
