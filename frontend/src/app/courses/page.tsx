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
  ArrowDown,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CartModal } from '@/components/CartModal';
import { CourseCard } from '@/components/ui/CourseCard';
import { CompactHorizontalCard } from '@/components/ui/CompactHorizontalCard';
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
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
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
    setVisibleCount(9);
  }, [searchQuery, selectedType, selectedSubject, onlyFree, sortBy]);

  // Multilingual Strings
  const t = useMemo(() => {
    if (currentLang === 'en') {
      return {
        breadcrumb_home: dict.nav_home || 'Home',
        breadcrumb_current: dict.nav_courses || 'Academic Discourses',
        page_title: dict.catalog_courses_page_title || 'Archive of Specialized Courses & Discourses',
        page_subtitle:
          dict.catalog_courses_page_subtitle ||
          'Collection of academic discourses by Hojjat al-Islam Dr. Zanjirzan Hosseini across 8 branches of rational and transmitted disciplines.',
        type_all: dict.catalog_type_all || 'All Courses',
        type_offline: dict.catalog_type_offline || 'Offline',
        type_online: dict.catalog_type_online || 'Online',
        search_ph: dict.catalog_search_courses_ph || 'Search in course titles...',
        all_subjects: 'All Subjects',
        empty_title: 'No courses found matching your criteria',
        empty_desc: 'Try adjusting your search terms or clearing your filters.',
        featured_eyebrow: '[ Selected Scholarly Chairs ]',
        featured_title: dict.catalog_featured_heading || 'Featured Discourses & Special Debates',
        mobile_filter_btn: dict.catalog_filter_mobile_btn || 'Filters',
        sort_label: dict.catalog_sort_label || 'Sort by:',
        sort_default: dict.catalog_sort_default || 'Default',
        sort_newest: dict.catalog_sort_newest || 'Newest',
        sort_popular: dict.catalog_sort_popular || 'Most Popular',
        sort_price_asc: dict.catalog_sort_price_asc || 'Lowest Tuition',
        sort_price_desc: dict.catalog_sort_price_desc || 'Highest Tuition',
        load_more_btn: dict.catalog_load_more_btn || 'Load More Discourses',
        all_loaded: dict.catalog_all_loaded || 'All discourses in this section are displayed',
        view_grid: dict.catalog_view_grid || 'Grid View',
        view_list: dict.catalog_view_list || 'List View',
        total_courses_count: dict.catalog_total_courses_count || 'Specialized Academic Discourses',
        clear_all: dict.catalog_filter_clear_all || 'Clear Filters',
        free_badge: 'Free',
        active_filters_label: dict.catalog_active_filters_label || 'Active Filters:',
        discipline_prefix: dict.catalog_filter_discipline_prefix || 'Discipline:',
        type_prefix: dict.catalog_filter_type_prefix || 'Format:',
        remaining_label: dict.catalog_filter_remaining || 'remaining',
        loading_more: dict.catalog_loading_more || 'Loading...',
      };
    }
    if (currentLang === 'ar') {
      return {
        breadcrumb_home: dict.nav_home || 'الرئيسية',
        breadcrumb_current: dict.nav_courses || 'الدروس العلمية والتربوية',
        page_title: dict.catalog_courses_page_title || 'أرشيف الدروس والمحاضرات التخصصية',
        page_subtitle:
          dict.catalog_courses_page_subtitle ||
          'مجموعة الدروس والمحاضرات العلمية لحجة الإسلام الدكتور زنجیر زن حسيني في ۸ فروع من العلوم العقلية والنقلية.',
        type_all: dict.catalog_type_all || 'جميع الدورات',
        type_offline: dict.catalog_type_offline || 'مسجلة',
        type_online: dict.catalog_type_online || 'مباشرة',
        search_ph: dict.catalog_search_courses_ph || 'البحث في عناوين الدروس...',
        all_subjects: 'جميع الفروع',
        empty_title: 'لم يتم العثور على دروس مطابقة',
        empty_desc: 'يرجى تجربة كلمات بحث أو فلاتر أخرى.',
        featured_eyebrow: '[ كراسی تدريسية بارزة ومختارة ]',
        featured_title: dict.catalog_featured_heading || 'الدروس البارزة والمباحثات الخاصة',
        mobile_filter_btn: dict.catalog_filter_mobile_btn || 'الفلاتر',
        sort_label: dict.catalog_sort_label || 'الترتيب:',
        sort_default: dict.catalog_sort_default || 'الكل',
        sort_newest: dict.catalog_sort_newest || 'الأحدث',
        sort_popular: dict.catalog_sort_popular || 'الأكثر طلباً',
        sort_price_asc: dict.catalog_sort_price_asc || 'الأقل سعراً',
        sort_price_desc: dict.catalog_sort_price_desc || 'الأعلى سعراً',
        load_more_btn: dict.catalog_load_more_btn || 'عرض المزيد من الدروس',
        all_loaded: dict.catalog_all_loaded || 'تم عرض جميع الدروس في هذا القسم',
        view_grid: dict.catalog_view_grid || 'عرض شبكي',
        view_list: dict.catalog_view_list || 'عرض طولي',
        total_courses_count: dict.catalog_total_courses_count || 'درساً تخصصياً',
        clear_all: dict.catalog_filter_clear_all || 'إعادة ضبط الفلاتر',
        free_badge: 'مجاني',
        active_filters_label: dict.catalog_active_filters_label || 'الفلاتر النشطة:',
        discipline_prefix: dict.catalog_filter_discipline_prefix || 'الفرع:',
        type_prefix: dict.catalog_filter_type_prefix || 'النوع:',
        remaining_label: dict.catalog_filter_remaining || 'متبقي',
        loading_more: dict.catalog_loading_more || 'جاري التحميل...',
      };
    }
    return {
      breadcrumb_home: dict.nav_home || 'صفحه اصلی',
      breadcrumb_current: dict.nav_courses || 'درس‌گفتارهای علمی و تربیتی',
      page_title: dict.catalog_courses_page_title || 'آرشیو دوره‌ها و درس‌گفتارهای تخصصی',
      page_subtitle:
        dict.catalog_courses_page_subtitle ||
        'مجموعه درس‌گفتارها و سلسله جلسات علمی حجت الاسلام دکتر زنجیر زن حسینی در ۸ شاخه علوم عقلی و نقلی.',
      type_all: dict.catalog_type_all || 'همه دوره‌ها',
      type_offline: dict.catalog_type_offline || 'آفلاین',
      type_online: dict.catalog_type_online || 'آنلاین',
      search_ph: dict.catalog_search_courses_ph || 'جستجو در عناوین دروس...',
      all_subjects: 'همه شاخه‌ها',
      empty_title: 'دوره‌ای با این مشخصات یافت نشد',
      empty_desc: 'لطفاً عبارات جستجو یا فیلترهای دیگر را امتحان کنید.',
      featured_eyebrow: '[ کرسی‌های برجسته و منتخب ]',
      featured_title: dict.catalog_featured_heading || 'درس‌گفتارهای شاخص و مباحثات ویژه',
      mobile_filter_btn: dict.catalog_filter_mobile_btn || 'فیلترها',
      sort_label: dict.catalog_sort_label || 'مرتب‌سازی:',
      sort_default: dict.catalog_sort_default || 'همه',
      sort_newest: dict.catalog_sort_newest || 'جدیدترین',
      sort_popular: dict.catalog_sort_popular || 'محبوب‌ترین',
      sort_price_asc: dict.catalog_sort_price_asc || 'کمترین شهریه',
      sort_price_desc: dict.catalog_sort_price_desc || 'بیشترین شهریه',
      load_more_btn: dict.catalog_load_more_btn || 'مشاهده درس‌گفتارهای بیشتر',
      all_loaded: dict.catalog_all_loaded || 'تمام درس‌گفتارهای این بخش نمایش داده شد',
      view_grid: dict.catalog_view_grid || 'نمای شبکه‌ای',
      view_list: dict.catalog_view_list || 'نمای سطری',
      total_courses_count: dict.catalog_total_courses_count || 'عنوان درس‌گفتار تخصصی',
      clear_all: dict.catalog_filter_clear_all || 'پاک‌سازی فیلترها',
      free_badge: 'رایگان',
      active_filters_label: dict.catalog_active_filters_label || 'فیلترهای فعال:',
      discipline_prefix: dict.catalog_filter_discipline_prefix || 'شاخه:',
      type_prefix: dict.catalog_filter_type_prefix || 'نوع:',
      remaining_label: dict.catalog_filter_remaining || 'باقی‌مانده',
      loading_more: dict.catalog_loading_more || 'در حال دریافت...',
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

  // Paginated visible list
  const displayedCourses = useMemo(() => {
    return sortedCourses.slice(0, visibleCount);
  }, [sortedCourses, visibleCount]);

  // Featured Courses
  const featuredCourses = useMemo(() => {
    return uniqueCourses.slice(0, 3);
  }, [uniqueCourses]);

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

  const handleLoadMore = () => {
    triggerTactileHaptic('tick');
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 6);
      setIsLoadingMore(false);
    }, 250);
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
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
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
                <span className="w-4 h-4 rounded-full bg-[#8A532B] dark:bg-[#C58B43] text-white text-[10px] font-mono flex items-center justify-center">
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
                  className={`px-2.5 py-1 rounded-lg transition-all duration-200 ease-out font-medium cursor-pointer active:scale-95 ${
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
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            {displayedCourses.length > 0 ? (
              <>
                <div
                  key={`courses-grid-${selectedSubject}-${selectedType}-${onlyFree}-${sortBy}-${searchQuery}-${visibleCount}`}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch animate-tab-fade"
                >
                  {displayedCourses.map((c, idx) => {
                    const isCurrentPlaying = isPlaying && currentCourse?.id === c.id;
                    return (
                      <CourseCard
                        key={c.id}
                        course={c}
                        index={idx}
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

                {/* Incremental "Load More" Pagination Section */}
                <div className="pt-6 flex flex-col items-center justify-center text-center space-y-3">
                  {visibleCount < sortedCourses.length ? (
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="px-6 py-3 rounded-full bg-white dark:bg-[#141518] hover:bg-zinc-50 dark:hover:bg-[#1C1E22] border border-[#8A532B]/30 dark:border-[#C58B43]/40 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-[#8A532B] dark:hover:text-[#C58B43] transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#8A532B] dark:text-[#C58B43]" />
                          <span>{t.loading_more}</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
                          <span>{t.load_more_btn}</span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            ({toLocaleDigits(sortedCourses.length - visibleCount, currentLang)} {t.remaining_label})
                          </span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-[#18191D] border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
                      <span>{t.all_loaded}</span>
                    </div>
                  )}
                </div>
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

        {/* Secondary "Featured" Row Separated by Thin Lines */}
        {featuredCourses.length > 0 && (
          <section className="pt-10 border-t border-[#E6E1D8] dark:border-[#24262D] space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#8A532B] dark:text-[#C58B43] font-bold block">
                {t.featured_eyebrow}
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {t.featured_title}
              </h2>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141518] rounded-2xl overflow-hidden shadow-xs">
              {featuredCourses.map((fc) => (
                <CompactHorizontalCard key={`featured-${fc.id}`} course={fc} />
              ))}
            </div>
          </section>
        )}
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
