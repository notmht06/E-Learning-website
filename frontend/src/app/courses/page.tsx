'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CartModal } from '@/components/CartModal';
import { CourseCard } from '@/components/ui/CourseCard';
import { CategoryTabStrip, TabItem } from '@/components/ui/CategoryTabStrip';
import { CompactHorizontalCard } from '@/components/ui/CompactHorizontalCard';
import { usePlayer } from '@/context/PlayerContext';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { getLocalizedCourse } from '@/lib/localization';

function CoursesContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get('subject') || 'all';

  const { currentLang, dict } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | 'offline' | 'online'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
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
        type_offline: dict.catalog_type_offline || 'Offline Courses',
        type_online: dict.catalog_type_online || 'Online Courses',
        search_ph: dict.catalog_search_courses_ph || 'Search in course titles...',
        all_subjects: 'All Subjects',
        empty_title: 'No courses found',
        empty_desc: 'Please try searching with different keywords or categories.',
        featured_eyebrow: '[ Selected Scholarly Chairs ]',
        featured_title: dict.catalog_featured_heading || 'Featured Discourses & Special Debates',
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
        type_offline: dict.catalog_type_offline || 'الدورات المسجلة',
        type_online: dict.catalog_type_online || 'الدورات المباشرة',
        search_ph: dict.catalog_search_courses_ph || 'البحث في عناوين الدروس...',
        all_subjects: 'جميع الفروع',
        empty_title: 'لم يتم العثور على دورات',
        empty_desc: 'يرجى تجربة كلمات بحث أو فروع دراسية أخرى.',
        featured_eyebrow: '[ كراسي تدريسية بارزة ومختارة ]',
        featured_title: dict.catalog_featured_heading || 'الدروس البارزة والمباحثات الخاصة',
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
      type_offline: dict.catalog_type_offline || 'دوره‌های آفلاین',
      type_online: dict.catalog_type_online || 'کارگاه‌های آنلاین',
      search_ph: dict.catalog_search_courses_ph || 'جستجو در عناوین دروس...',
      all_subjects: 'همه شاخه‌ها',
      empty_title: 'دوره‌ای با این مشخصات یافت نشد',
      empty_desc: 'لطفاً عبارات جستجو یا فیلترهای دیگر را امتحان کنید.',
      featured_eyebrow: '[ کرسی‌های برجسته و منتخب ]',
      featured_title: dict.catalog_featured_heading || 'درس‌گفتارهای شاخص و مباحثات ویژه',
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

  // Filter Logic
  const coursesList = useMemo(() => {
    return uniqueCourses.filter((c) => {
      const loc = getLocalizedCourse(c, currentLang);
      const title = (loc?.title || c.title_fa || '').toLowerCase();
      const desc = (loc?.desc || c.desc_fa || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || title.includes(q) || desc.includes(q);
      const matchesType = selectedType === 'all' || c.course_type === selectedType;
      const matchesSubject = selectedSubject === 'all' || c.subject === selectedSubject;

      return matchesSearch && matchesType && matchesSubject;
    });
  }, [uniqueCourses, currentLang, searchQuery, selectedType, selectedSubject]);

  // Featured Courses (first 2-3 courses)
  const featuredCourses = useMemo(() => {
    return uniqueCourses.slice(0, 3);
  }, [uniqueCourses]);

  // Subject tabs for CategoryTabStrip
  const subjectTabs: TabItem[] = useMemo(() => {
    const allTab: TabItem = {
      id: 'all',
      label: t.all_subjects,
      count: uniqueCourses.length,
    };

    const catTabs = categories.map((cat) => {
      const catCount = uniqueCourses.filter((c) => c.subject === cat.name).length;
      let label = cat.name;
      if (currentLang === 'en' && cat.name_en) label = cat.name_en;
      if (currentLang === 'ar' && cat.name_ar) label = cat.name_ar;

      return {
        id: cat.name,
        label,
        count: catCount,
      };
    });

    return [allTab, ...catTabs];
  }, [categories, courses, currentLang, t.all_subjects]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-zinc-900 dark:text-zinc-100 transition-colors pb-8">
      {/* Navbar */}
      <Navbar
        cartCount={cartItems.length}
        onOpenCart={openCart}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full text-start">
        {/* Page Header (Capped at text-2xl as per brief) */}
        <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200">
              {t.breadcrumb_home}
            </Link>
            <span>/</span>
            <span className="text-[#8A532B] dark:text-[#C58B43]">{t.breadcrumb_current}</span>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {t.page_title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {t.page_subtitle}
          </p>
        </div>

        {/* Type tabs (underline, per reference) + search */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          {/* Active Type Tab Strip (Offline vs Online) */}
          <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-xs font-medium">
            <button
              onClick={() => setSelectedType('all')}
              className={`pb-2 transition ${
                selectedType === 'all'
                  ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {t.type_all}
            </button>
            <button
              onClick={() => setSelectedType('offline')}
              className={`pb-2 transition ${
                selectedType === 'offline'
                  ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {t.type_offline}
            </button>
            <button
              onClick={() => setSelectedType('online')}
              className={`pb-2 transition ${
                selectedType === 'online'
                  ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {t.type_online}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.search_ph}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-8 pe-4 py-2 rounded-full bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] transition"
            />
          </div>
        </div>

        {/* Active Category Tab Strip with Minimal Underlines */}
        <div className="pt-2">
          <CategoryTabStrip
            tabs={subjectTabs}
            activeTab={selectedSubject}
            onChange={setSelectedSubject}
          />
        </div>

        {/* Courses Grid */}
        {coursesList.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            {coursesList.map((c) => {
              const isCurrentPlaying = isPlaying && currentCourse?.id === c.id;

              return (
                <CourseCard
                  key={c.id}
                  course={c}
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
        ) : (
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-8 text-center space-y-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {t.empty_title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.empty_desc}
            </p>
          </div>
        )}

        {/* Secondary "Featured" Row Separated by Thin Lines */}
        {featuredCourses.length > 0 && (
          <section className="pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
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
