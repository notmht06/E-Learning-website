'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CartModal } from '@/components/CartModal';
import { CourseCard } from '@/components/ui/CourseCard';
import { CourseCatalogSidebar } from '@/components/catalog/CourseCatalogSidebar';
import { CourseCatalogMobileFilterDrawer } from '@/components/catalog/CourseCatalogMobileFilterDrawer';
import { usePlayer } from '@/context/PlayerContext';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { getLocalizedCourse } from '@/lib/localization';
import { parseNumericPrice } from '@/lib/utils';
import { triggerTactileHaptic } from '@/lib/haptics';
import { toLocaleDigits } from '@/lib/data';

function CoursesContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get('subject') || 'all';

  const { currentLang, dict, localizeHref } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | 'offline' | 'online'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [onlyFree, setOnlyFree] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');
  const COURSES_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  const {
    items: cartItems,
    isOpen: isCartOpen,
    openCart,
    closeCart,
    removeItem,
  } = useCart();

  const { playTrack, togglePlay, isPlaying, currentCourse } = usePlayer();
  const { courses, categories } = useData();

  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    if (subjectParam) {
      setSelectedSubject(subjectParam);
    }
  }, [searchParams]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedSubject, onlyFree, sortBy]);

  // Multilingual Strings
  const t = useMemo(() => {
    if (currentLang === 'en') {
      return {
        breadcrumb_home: dict.nav_home,
        breadcrumb_current: dict.nav_courses,
        page_title: dict.catalog_courses_page_title,
        page_subtitle:
          dict.catalog_courses_page_subtitle,
        type_all: dict.catalog_type_all,
        type_offline: dict.catalog_type_offline,
        type_online: dict.catalog_type_online,
        search_ph: dict.catalog_search_courses_ph,
        all_subjects: 'All Subjects',
        empty_title: 'No courses found matching your criteria',
        empty_desc: 'Try adjusting your search terms or clearing your filters.',
        mobile_filter_btn: dict.catalog_filter_mobile_btn,
        sort_label: dict.catalog_sort_label,
        sort_default: dict.catalog_sort_default,
        sort_newest: dict.catalog_sort_newest,
        sort_popular: dict.catalog_sort_popular,
        sort_price_asc: dict.catalog_sort_price_asc,
        sort_price_desc: dict.catalog_sort_price_desc,
        load_more_btn: dict.catalog_load_more_btn,
        all_loaded: dict.catalog_all_loaded,
        view_grid: dict.catalog_view_grid,
        view_list: dict.catalog_view_list,
        total_courses_count: dict.catalog_total_courses_count,
        clear_all: dict.catalog_filter_clear_all,
        free_badge: 'Free',
        active_filters_label: dict.catalog_active_filters_label,
        discipline_prefix: dict.catalog_filter_discipline_prefix,
        type_prefix: dict.catalog_filter_type_prefix,
        remaining_label: dict.catalog_filter_remaining,
        loading_more: dict.catalog_loading_more,
      };
    }
    if (currentLang === 'ar') {
      return {
        breadcrumb_home: dict.nav_home,
        breadcrumb_current: dict.nav_courses,
        page_title: dict.catalog_courses_page_title,
        page_subtitle:
          dict.catalog_courses_page_subtitle,
        type_all: dict.catalog_type_all,
        type_offline: dict.catalog_type_offline,
        type_online: dict.catalog_type_online,
        search_ph: dict.catalog_search_courses_ph,
        all_subjects: 'جميع الفروع',
        empty_title: 'لم يتم العثور على دروس مطابقة',
        empty_desc: 'يرجى تجربة كلمات بحث أو فلاتر أخرى.',
        mobile_filter_btn: dict.catalog_filter_mobile_btn,
        sort_label: dict.catalog_sort_label,
        sort_default: dict.catalog_sort_default,
        sort_newest: dict.catalog_sort_newest,
        sort_popular: dict.catalog_sort_popular,
        sort_price_asc: dict.catalog_sort_price_asc,
        sort_price_desc: dict.catalog_sort_price_desc,
        load_more_btn: dict.catalog_load_more_btn,
        all_loaded: dict.catalog_all_loaded,
        view_grid: dict.catalog_view_grid,
        view_list: dict.catalog_view_list,
        total_courses_count: dict.catalog_total_courses_count,
        clear_all: dict.catalog_filter_clear_all,
        free_badge: 'مجاني',
        active_filters_label: dict.catalog_active_filters_label,
        discipline_prefix: dict.catalog_filter_discipline_prefix,
        type_prefix: dict.catalog_filter_type_prefix,
        remaining_label: dict.catalog_filter_remaining,
        loading_more: dict.catalog_loading_more,
      };
    }
    return {
      breadcrumb_home: dict.nav_home,
      breadcrumb_current: dict.nav_courses,
      page_title: dict.catalog_courses_page_title,
      page_subtitle:
        dict.catalog_courses_page_subtitle,
      type_all: dict.catalog_type_all,
      type_offline: dict.catalog_type_offline,
      type_online: dict.catalog_type_online,
      search_ph: dict.catalog_search_courses_ph,
      all_subjects: 'همه شاخه‌ها',
      empty_title: 'دوره‌ای با این مشخصات یافت نشد',
      empty_desc: 'لطفاً عبارات جستجو یا فیلترهای دیگر را امتحان کنید.',
      mobile_filter_btn: dict.catalog_filter_mobile_btn,
      sort_label: dict.catalog_sort_label,
      sort_default: dict.catalog_sort_default,
      sort_newest: dict.catalog_sort_newest,
      sort_popular: dict.catalog_sort_popular,
      sort_price_asc: dict.catalog_sort_price_asc,
      sort_price_desc: dict.catalog_sort_price_desc,
      load_more_btn: dict.catalog_load_more_btn,
      all_loaded: dict.catalog_all_loaded,
      view_grid: dict.catalog_view_grid,
      view_list: dict.catalog_view_list,
      total_courses_count: dict.catalog_total_courses_count,
      clear_all: dict.catalog_filter_clear_all,
      free_badge: 'رایگان',
      active_filters_label: dict.catalog_active_filters_label,
      discipline_prefix: dict.catalog_filter_discipline_prefix,
      type_prefix: dict.catalog_filter_type_prefix,
      remaining_label: dict.catalog_filter_remaining,
      loading_more: dict.catalog_loading_more,
    };
  }, [currentLang, dict]);

  // Deduplicated unique courses list
  const uniqueCourses = useMemo(() => {
    const all = Object.values(courses);
    const seen = new Set<string>();
    return all.filter((c) => {
      if (!c?.id || seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [courses]);

  // Filter & Search Logic
  const filteredCourses = useMemo(() => {
    return uniqueCourses.filter((c) => {
      const loc = getLocalizedCourse(c, currentLang);
      const title = (loc?.title || c.title_fa || '').toLowerCase();
      const desc = (loc?.desc || c.desc_fa || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || title.includes(q) || desc.includes(q);
      const matchesType = selectedType === 'all' || c.course_type === selectedType;
      const matchesSubject =
        selectedSubject === 'all' ||
        c.subject === selectedSubject ||
        categories.some(
          (cat) =>
            cat.name === c.subject &&
            (cat.name_en === selectedSubject ||
              cat.name_ar === selectedSubject ||
              cat.slug === selectedSubject ||
              cat.name === selectedSubject)
        );

      const isFreeCourse =
        parseNumericPrice(c.price_fa) === 0 ||
        (c.price_fa && c.price_fa.includes('رایگان')) ||
        (c.price_en && c.price_en.toLowerCase().includes('free'));
      const matchesFree = !onlyFree || isFreeCourse;

      return matchesSearch && matchesType && matchesSubject && matchesFree;
    });
  }, [uniqueCourses, currentLang, searchQuery, selectedType, selectedSubject, onlyFree, categories]);

  // Sorting Logic
  const sortedCourses = useMemo(() => {
    const list = [...filteredCourses];
    if (sortBy === 'newest') {
      return list.reverse();
    }
    if (sortBy === 'popular') {
      return list.sort((a, b) => (b.chapters?.length || 0) - (a.chapters?.length || 0));
    }
    if (sortBy === 'price_asc') {
      return list.sort((a, b) => parseNumericPrice(a.price_fa) - parseNumericPrice(b.price_fa));
    }
    if (sortBy === 'price_desc') {
      return list.sort((a, b) => parseNumericPrice(b.price_fa) - parseNumericPrice(a.price_fa));
    }
    return list;
  }, [filteredCourses, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedCourses.length / COURSES_PER_PAGE));

  // Paginated visible list (9 courses per page)
  const displayedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    return sortedCourses.slice(startIndex, startIndex + COURSES_PER_PAGE);
  }, [sortedCourses, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    triggerTactileHaptic('tick');
    setCurrentPage(page);
    const catalogEl = document.getElementById('courses-catalog-main');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 250, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis-start');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis-end');
      pages.push(totalPages);
    }
    return pages;
  };

  const getCategoryDisplayName = (subjectName: string) => {
    const cat = categories.find(
      (c) =>
        c.name === subjectName ||
        c.name_en === subjectName ||
        c.name_ar === subjectName ||
        c.slug === subjectName
    );
    if (!cat) return subjectName;
    if (currentLang === 'en' && cat.name_en) return cat.name_en;
    if (currentLang === 'ar' && cat.name_ar) return cat.name_ar;
    return cat.name;
  };

  // Active filters tracker
  const activeFiltersCount =
    (selectedSubject !== 'all' ? 1 : 0) +
    (selectedType !== 'all' ? 1 : 0) +
    (onlyFree ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleClearAllFilters = () => {
    setSelectedSubject('all');
    setSelectedType('all');
    setOnlyFree(false);
    setSearchQuery('');
    setSortBy('default');
  };



  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-zinc-900 dark:text-zinc-100 transition-colors pb-12">
      {/* Navbar */}
      <Navbar cartCount={cartItems.length} onOpenCart={openCart} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full text-start">
        {/* Page Header (Editorial & Traditional) */}
        <div className="space-y-2 border-b border-[#E6E1D8] dark:border-[#24262D] pb-5">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Link href={localizeHref('/')} className="hover:text-zinc-700 dark:hover:text-zinc-200">
              {t.breadcrumb_home}
            </Link>
            <span>/</span>
            <span className="text-[#8A532B] dark:text-[#C58B43]">{t.breadcrumb_current}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {t.page_title}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mt-1">
                {t.page_subtitle}
              </p>
            </div>

            {/* Total Courses Counter Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] text-xs font-mono text-[#8A532B] dark:text-[#C58B43] shadow-xs shrink-0 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
              <span>
                {toLocaleDigits(sortedCourses.length, currentLang)} {t.total_courses_count}
              </span>
            </div>
          </div>
        </div>

        {/* Catalog Control Bar (Search, Mobile Filter Trigger, Sort, View Switcher) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] rounded-2xl shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.search_ph}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-9 pe-8 py-2 rounded-xl bg-zinc-50 dark:bg-[#1C1E22] border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] dark:focus:border-[#C58B43] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="پاک کردن جستجو"
                title="پاک کردن جستجو"
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ms-auto">
            {/* Mobile Filter Drawer Button (Visible on < lg) */}
            <button
              onClick={() => {
                triggerTactileHaptic('tick');
                setIsMobileFilterOpen(true);
              }}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-[#1C1E22] hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
              <span>{t.mobile_filter_btn}</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#8A532B] dark:bg-[#C58B43] text-white text-[11px] font-mono flex items-center justify-center">
                  {toLocaleDigits(activeFiltersCount, currentLang)}
                </span>
              )}
            </button>

            {/* Desktop Sorting Tabs */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-zinc-50 dark:bg-[#1C1E22] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs">
              <span className="text-[11px] font-mono text-zinc-400 px-2">{t.sort_label}</span>
              {[
                { id: 'default', label: t.sort_default },
                { id: 'newest', label: t.sort_newest },
                { id: 'popular', label: t.sort_popular },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    triggerTactileHaptic('tick');
                    setSortBy(opt.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200 ease-out font-medium cursor-pointer active:scale-95 ${
                    sortBy === opt.id
                      ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* View Mode Indicator (Square Grid Active) */}
            <div className="flex items-center p-1 bg-zinc-50 dark:bg-[#1C1E22] border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <div
                title={t.view_grid}
                className="p-1.5 rounded-lg bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs cursor-default flex items-center justify-center"
              >
                <LayoutGrid className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar (Shown when any filter is active) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">{t.active_filters_label}</span>

            {selectedSubject !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/30">
                <span>{t.discipline_prefix} {getCategoryDisplayName(selectedSubject)}</span>
                <button
                  onClick={() => setSelectedSubject('all')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/30">
                <span>
                  {t.type_prefix} {selectedType === 'offline' ? t.type_offline : t.type_online}
                </span>
                <button
                  onClick={() => setSelectedType('all')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {onlyFree && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/30">
                <span>{t.free_badge}</span>
                <button
                  onClick={() => setOnlyFree(false)}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <span>«{searchQuery}»</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8A532B] dark:text-[#C58B43] hover:underline cursor-pointer ms-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.clear_all}</span>
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout (Sidebar on lg+, Courses Grid on Main) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Main Catalog Courses Column (9 cols on xl, 8 on lg) */}
          <div id="courses-catalog-main" className="lg:col-span-8 xl:col-span-9 space-y-8 scroll-mt-24">
            {displayedCourses.length > 0 ? (
              <>
                <div
                  key={`courses-grid-${selectedSubject}-${selectedType}-${onlyFree}-${sortBy}-${searchQuery}-${currentPage}`}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch animate-tab-fade"
                >
                  {displayedCourses.map((c, idx) => {
                    const isCurrentPlaying = isPlaying && currentCourse?.id === c.id;
                    return (
                      <CourseCard
                        key={c.id}
                        course={c}
                        index={idx + (currentPage - 1) * COURSES_PER_PAGE}
                        isPlaying={isCurrentPlaying}
                        onPlaySample={() => {
                          if (isCurrentPlaying) {
                            togglePlay();
                          } else {
                            playTrack(c, 0);
                          }
                        }}
                      />
                    );
                  })}
                </div>

                {/* Multipage Numbered Pagination Section */}
                {totalPages > 1 && (
                  <nav
                    role="navigation"
                    aria-label="صفحات دوره‌ها"
                    className="pt-8 flex flex-col items-center justify-center space-y-3"
                  >
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {/* Previous Page Button */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141518] text-zinc-700 dark:text-zinc-300 hover:border-[#8A532B] dark:hover:border-[#C58B43] hover:text-[#8A532B] dark:hover:text-[#C58B43] disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 shadow-xs cursor-pointer select-none"
                        aria-label={dict.reader_btn_prev || 'صفحه قبل'}
                      >
                        {currentLang === 'en' ? (
                          <ChevronLeft className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span>{dict.reader_btn_prev || 'صفحه قبل'}</span>
                      </button>

                      {/* Numbered Page Buttons */}
                      {getPageNumbers().map((item, index) => {
                        if (typeof item === 'string') {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="w-8 h-9 flex items-center justify-center text-zinc-400 font-mono text-sm select-none"
                            >
                              …
                            </span>
                          );
                        }

                        const isCurrent = item === currentPage;
                        return (
                          <button
                            key={`page-${item}`}
                            type="button"
                            onClick={() => handlePageChange(item)}
                            aria-current={isCurrent ? 'page' : undefined}
                            className={`min-w-9 h-9 px-2.5 rounded-xl text-xs font-bold font-num tabular-nums transition flex items-center justify-center cursor-pointer select-none ${
                              isCurrent
                                ? 'bg-[#8A532B] text-white dark:bg-[#C58B43] dark:text-[#0C0D0E] shadow-sm ring-1 ring-[#8A532B]/30'
                                : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141518] text-zinc-700 dark:text-zinc-300 hover:border-[#8A532B] dark:hover:border-[#C58B43] hover:text-[#8A532B] dark:hover:text-[#C58B43] shadow-xs'
                            }`}
                          >
                            {toLocaleDigits(item, currentLang)}
                          </button>
                        );
                      })}

                      {/* Next Page Button */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141518] text-zinc-700 dark:text-zinc-300 hover:border-[#8A532B] dark:hover:border-[#C58B43] hover:text-[#8A532B] dark:hover:text-[#C58B43] disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 shadow-xs cursor-pointer select-none"
                        aria-label={dict.reader_btn_next || 'صفحه بعد'}
                      >
                        <span>{dict.reader_btn_next || 'صفحه بعد'}</span>
                        {currentLang === 'en' ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronLeft className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Pagination summary info */}
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-num tabular-nums text-center">
                      {dict.reader_page} {toLocaleDigits(currentPage, currentLang)} {dict.reader_of} {toLocaleDigits(totalPages, currentLang)}
                    </p>
                  </nav>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center mx-auto">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {t.empty_title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    {t.empty_desc}
                  </p>
                </div>
                <button
                  onClick={handleClearAllFilters}
                  className="px-4 py-2 rounded-xl bg-[#8A532B] dark:bg-[#C58B43] text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.clear_all}</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop Filter Sidebar (3 cols on xl, 4 on lg) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-28">
            <CourseCatalogSidebar
              categories={categories}
              selectedSubject={selectedSubject}
              onSelectSubject={setSelectedSubject}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              onlyFree={onlyFree}
              onToggleOnlyFree={setOnlyFree}
              courses={uniqueCourses}
              onClearFilters={handleClearAllFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      <CourseCatalogMobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        categories={categories}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        onlyFree={onlyFree}
        onToggleOnlyFree={setOnlyFree}
        sortBy={sortBy}
        onSelectSortBy={setSortBy}
        courses={uniqueCourses}
        filteredCount={sortedCourses.length}
        onClearFilters={handleClearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={closeCart}
        items={cartItems}
        onRemoveItem={removeItem}
      />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">در حال بارگذاری دوره‌ها...</div>}>
      <CoursesContent />
    </Suspense>
  );
}
