'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  ArrowLeft,
  Search,
  X,
  BookOpen,
  FileText,
  SlidersHorizontal,
  RotateCcw,
  LayoutGrid,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CartModal } from '@/components/CartModal';
import { EmptyStateCard } from '@/components/ui/FeedbackStates';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
} from '@/components/ui';
import {
  scholarlyArticlesDatabase,
  ScholarlyArticle,
  CourseCategory,
  initialCategories,
  toLocaleDigits,
} from '@/lib/data';
import { useData } from '@/context/DataContext';
import { getLocalizedArticle } from '@/lib/localization';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { SCHOLAR_NAME } from '@/lib/constants';
import { triggerTactileHaptic } from '@/lib/haptics';
import { ArticleCatalogSidebar } from '@/components/catalog/ArticleCatalogSidebar';
import { ArticleCatalogMobileFilterDrawer } from '@/components/catalog/ArticleCatalogMobileFilterDrawer';

export default function ArticlesPage() {
  const { currentLang, dict, toLocale, localizeHref } = useLanguage();
  const { categories, articles: dataArticles } = useData();
  const { items: cartItems, isOpen: isCartOpen, openCart, closeCart, removeItem } = useCart();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [readTimeFilter, setReadTimeFilter] = useState<'all' | 'short' | 'deep'>('all');
  const [onlyQuickAbstract, setOnlyQuickAbstract] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ScholarlyArticle | null>(null);

  const allArticlesList = useMemo(() => {
    return dataArticles && dataArticles.length > 0 ? dataArticles : scholarlyArticlesDatabase;
  }, [dataArticles]);

  const activeCategories: CourseCategory[] = useMemo(() => {
    return categories && categories.length > 0 ? categories : initialCategories;
  }, [categories]);

  const categoryOptions = useMemo(() => {
    const totalCount = allArticlesList.length;
    const getCount = (cat: CourseCategory) =>
      allArticlesList.filter(
        (a) =>
          a.category === cat.name_fa ||
          a.category === cat.name ||
          a.category_fa === cat.name_fa ||
          a.category === cat.slug
      ).length;

    const allLabel =
      dict.catalog_filter_all_categories || dict.ui_all_treatises || 'همه موضوعات';

    const catItems = activeCategories.map((cat) => {
      const label =
        currentLang === 'en' && cat.name_en
          ? cat.name_en
          : currentLang === 'ar' && cat.name_ar
          ? cat.name_ar
          : cat.name_fa || cat.name;

      return {
        id: cat.name_fa || cat.name,
        label,
        count: getCount(cat),
      };
    });

    return [
      {
        id: 'all',
        label: allLabel,
        count: totalCount,
      },
      ...catItems,
    ];
  }, [allArticlesList, activeCategories, currentLang, dict]);

  const getCategoryDisplayName = (catName: string) => {
    const cat = activeCategories.find(
      (c) =>
        c.name === catName ||
        c.name_fa === catName ||
        c.name_en === catName ||
        c.name_ar === catName ||
        c.slug === catName
    );
    if (!cat) return catName;
    if (currentLang === 'en' && cat.name_en) return cat.name_en;
    if (currentLang === 'ar' && cat.name_ar) return cat.name_ar;
    return cat.name_fa || cat.name;
  };

  const articles = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = allArticlesList.filter((art) => {
      const loc = getLocalizedArticle(art, currentLang);
      const title = (loc?.title || art.title_fa || art.title).toLowerCase();
      const abs = (loc?.abstract || art.abstract_fa || art.abstract).toLowerCase();
      const matchesSearch = !q || title.includes(q) || abs.includes(q);
      const matchesCat =
        selectedCategory === 'all' ||
        art.category === selectedCategory ||
        art.category_fa === selectedCategory ||
        activeCategories.some(
          (c) =>
            (c.name === selectedCategory || c.name_fa === selectedCategory || c.slug === selectedCategory) &&
            (c.name === art.category || c.name_fa === art.category || c.slug === art.category)
        );
      const rawMinutes = parseInt((art.readTime || '').replace(/[^\d]/g, '') || '10', 10);
      const matchesReadTime =
        readTimeFilter === 'all'
          ? true
          : readTimeFilter === 'short'
          ? rawMinutes < 15
          : rawMinutes >= 15;

      const matchesAbstract = !onlyQuickAbstract || Boolean(art.abstract && art.abstract.length > 0);

      return matchesSearch && matchesCat && matchesReadTime && matchesAbstract;
    });

    if (sortBy === 'newest') {
      return [...list].reverse();
    }
    return list;
  }, [
    allArticlesList,
    search,
    selectedCategory,
    readTimeFilter,
    onlyQuickAbstract,
    currentLang,
    activeCategories,
    sortBy,
  ]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (readTimeFilter !== 'all' ? 1 : 0) +
    (onlyQuickAbstract ? 1 : 0) +
    (search.trim() ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0;

  const handleClearAllFilters = () => {
    setSelectedCategory('all');
    setReadTimeFilter('all');
    setOnlyQuickAbstract(false);
    setSearch('');
    setSortBy('default');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#0C0D0E] dark:text-[#FAF8F5] transition-colors pb-12">
      <Navbar
        cartCount={cartItems.length}
        onOpenCart={openCart}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full text-start">
        {/* Header */}
        <div className="border-b border-[#E6E1D8] dark:border-[#22242A] pb-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Link href={localizeHref('/')} className="hover:text-zinc-700 dark:hover:text-zinc-200">
              {dict.nav_home}
            </Link>
            <span>/</span>
            <span className="text-[#8A532B] dark:text-[#C58B43]">
              {dict.nav_articles}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              {/* Scholar official identity: حجت الاسلام دکتر زنجیرزن حسینی */}
              <h1 className="text-xl sm:text-2xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5] leading-snug">
                {dict.articles_home_title}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mt-1">
                {dict.articles_home_desc}
              </p>
            </div>

            {/* Total Articles Counter Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] text-xs font-mono text-[#8A532B] dark:text-[#C58B43] shadow-xs shrink-0 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
              <span>
                {toLocaleDigits(articles.length, currentLang)} {dict.articles_count_label || 'عنوان مقاله پژوهشی'}
              </span>
            </div>
          </div>
        </div>

        {/* Control Bar (Search, Mobile Filter Trigger, Sort, View Indicator) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] rounded-2xl shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={dict.ui_search_article_titles_abstracts || 'جستجو در موضوعات و چکیده‌ها...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-9 pe-8 py-2 rounded-xl bg-zinc-50 dark:bg-[#1C1E22] border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] dark:focus:border-[#C58B43] transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="پاک کردن جستجو"
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
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
              <span>{dict.catalog_filter_mobile_btn || 'فیلترها'}</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#8A532B] dark:bg-[#C58B43] text-white text-[11px] font-mono flex items-center justify-center">
                  {toLocaleDigits(activeFiltersCount, currentLang)}
                </span>
              )}
            </button>

            {/* Desktop Sorting Tabs */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-zinc-50 dark:bg-[#1C1E22] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs">
              <span className="text-[11px] font-mono text-zinc-400 px-2">{dict.catalog_sort_label || 'مرتب‌سازی:'}</span>
              {[
                { id: 'default', label: dict.catalog_sort_default || 'همه' },
                { id: 'newest', label: dict.catalog_sort_newest || 'جدیدترین' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    triggerTactileHaptic('tick');
                    setSortBy(opt.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition duration-200 ease-out font-medium cursor-pointer active:scale-95 ${
                    sortBy === opt.id
                      ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* View Mode Indicator */}
            <div className="flex items-center p-1 bg-zinc-50 dark:bg-[#1C1E22] border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <div
                title={dict.catalog_view_grid || 'نمای شبکه‌ای'}
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
            <span className="text-zinc-400 font-mono text-[11px]">{dict.catalog_active_filters_label || 'فیلترهای فعال:'}</span>

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/30">
                <span>{dict.catalog_filter_discipline_prefix || 'شاخه:'} {getCategoryDisplayName(selectedCategory)}</span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="hover:opacity-75 cursor-pointer"
                  aria-label="حذف فیلتر شاخه"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {readTimeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/30">
                <span>
                  زمان: {readTimeFilter === 'short' ? 'کوتاه (زیر ۱۵ دقیقه)' : 'عمیق (+۱۵ دقیقه)'}
                </span>
                <button
                  onClick={() => setReadTimeFilter('all')}
                  className="hover:opacity-75 cursor-pointer"
                  aria-label="حذف فیلتر زمان"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {onlyQuickAbstract && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/30">
                <span>دارای چکیده سریع</span>
                <button
                  onClick={() => setOnlyQuickAbstract(false)}
                  className="hover:opacity-75 cursor-pointer"
                  aria-label="حذف فیلتر چکیده"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {search.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <span>«{search.trim()}»</span>
                <button
                  onClick={() => setSearch('')}
                  className="hover:opacity-75 cursor-pointer"
                  aria-label="حذف جستجو"
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
              <span>{dict.catalog_filter_clear_all || 'پاک کردن فیلترها'}</span>
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout (Sidebar on lg+, Articles Grid on Main) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Main Articles Column (8 cols on lg, 9 on xl) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {articles.length === 0 ? (
              <EmptyStateCard
                title={dict.ui_no_matching_articles_found}
                description={dict.ui_try_clearing_your_search_filter_or_sel}
                actionLabel={dict.ui_reset_filters}
                onActionClick={handleClearAllFilters}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {articles.map((art, index) => {
                  const loc = getLocalizedArticle(art, currentLang);
                  const artTitle = loc?.title || art.title_fa || art.title;
                  const artCat = loc?.category || art.category_fa || art.category;
                  const artReadTime = loc?.readTime || art.readTime_fa || art.readTime;
                  const artDate = loc?.publishDate || art.publishDate_fa || art.publishDate;
                  const artAbstract = loc?.abstract || art.abstract_fa || art.abstract;

                  return (
                    <Card
                      key={art.id}
                      className="hover:border-[#8A532B]/50 flex flex-col justify-between space-y-4 transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-200"
                    >
                      <CardHeader className="space-y-3 pb-0">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-zinc-400">
                              شماره {toLocale(index + 1)}
                            </span>
                            <Badge variant="accent" className="text-[11px]">
                              {artCat}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px] font-num">
                            <Clock className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                            <span>{toLocale(artReadTime)}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Link href={localizeHref(`/articles/${art.slug}`)} className="block">
                            <CardTitle className="text-base font-bold text-[#0C0D0E] dark:text-[#FAF8F5] hover:text-[#8A532B] dark:hover:text-[#C58B43] leading-snug line-clamp-2 min-h-[2.75rem] transition">
                              {artTitle}
                            </CardTitle>
                          </Link>
                          <CardDescription className="text-xs text-zinc-500">
                            {dict.articles_modal_author}{' '}
                            {dict.scholar_name || SCHOLAR_NAME}
                          </CardDescription>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3 text-justify">
                          {artAbstract}
                        </p>
                      </CardHeader>

                      <CardFooter className="pt-3 border-t border-[#E6E1D8] dark:border-[#22242A] flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-zinc-400 font-num">
                          {toLocale(artDate)}
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedArticle(art)}
                            className="text-xs font-bold gap-1"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
                            <span>
                              {dict.ui_quick_abstract}
                            </span>
                          </Button>

                          <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="text-xs font-bold gap-1.5"
                          >
                            <Link href={localizeHref(`/articles/${art.slug}`)}>
                              <span>
                                {dict.ui_read_full_treatise}
                              </span>
                              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                            </Link>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Filter Sidebar (4 cols on lg, 3 on xl) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-28">
            <ArticleCatalogSidebar
              categories={activeCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              articles={allArticlesList}
              selectedReadTime={readTimeFilter}
              onSelectReadTime={setReadTimeFilter}
              onlyQuickAbstract={onlyQuickAbstract}
              onToggleOnlyQuickAbstract={setOnlyQuickAbstract}
              onClearFilters={handleClearAllFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </div>
      </main>

      {/* Quick Abstract Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 text-start shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-[#E6E1D8] dark:border-[#22242A] pb-4">
              <div className="space-y-1.5">
                <span className="px-3 py-0.5 rounded-full bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] font-bold text-xs inline-block">
                  {getLocalizedArticle(selectedArticle, currentLang)?.category ||
                    selectedArticle.category_fa}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
                  {getLocalizedArticle(selectedArticle, currentLang)?.title ||
                    selectedArticle.title_fa}
                </h3>
                <p className="text-xs text-zinc-500">
                  {dict.scholar_name || SCHOLAR_NAME} •{' '}
                  {getLocalizedArticle(selectedArticle, currentLang)?.publishDate ||
                    selectedArticle.publishDate_fa}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed text-justify">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] space-y-1.5">
                <span className="font-bold text-[#8A532B] dark:text-[#C58B43] block text-xs">
                  {dict.articles_modal_abstract}
                </span>
                <p>
                  {getLocalizedArticle(selectedArticle, currentLang)?.abstract ||
                    selectedArticle.abstract_fa}
                </p>
              </div>

              {selectedArticle.content_fa && (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] space-y-1.5">
                  <span className="font-bold text-[#8A532B] dark:text-[#C58B43] block text-xs">
                    گزیدهٔ متن تفصیلی مقاله
                  </span>
                  {/<[a-z][\s\S]*>/i.test(selectedArticle.content_fa) ? (
                    <div
                      className="prose dark:prose-invert max-w-none text-xs leading-[2.1] cms-rich-content max-h-60 overflow-y-auto pe-1"
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content_fa }}
                    />
                  ) : (
                    <p className="line-clamp-4">{selectedArticle.content_fa}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E6E1D8] dark:border-[#22242A]">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2.5 rounded-xl border border-[#E6E1D8] dark:border-[#22242A] text-xs font-bold text-zinc-600 dark:text-zinc-300 cursor-pointer"
              >
                {dict.articles_modal_close}
              </button>

              <Link
                href={localizeHref(`/articles/${selectedArticle.slug}`)}
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold flex items-center gap-2 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>
                  {dict.ui_open_dedicated_article_page}
                </span>
                <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      <ArticleCatalogMobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        categories={activeCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedReadTime={readTimeFilter}
        onSelectReadTime={setReadTimeFilter}
        onlyQuickAbstract={onlyQuickAbstract}
        onToggleOnlyQuickAbstract={setOnlyQuickAbstract}
        sortBy={sortBy}
        onSelectSortBy={setSortBy}
        articles={allArticlesList}
        filteredCount={articles.length}
        onClearFilters={handleClearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <CartModal
        isOpen={isCartOpen}
        items={cartItems}
        currentLang={currentLang}
        onClose={closeCart}
        onRemoveItem={removeItem}
      />
    </div>
  );
}
