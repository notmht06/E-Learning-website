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
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { scholarlyArticlesDatabase, ScholarlyArticle } from '@/lib/data';
import { getLocalizedArticle } from '@/lib/localization';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { SCHOLAR_NAME } from '@/lib/constants';
import { triggerTactileHaptic } from '@/lib/haptics';

export default function ArticlesPage() {
  const { currentLang, dict, toLocale, localizeHref } = useLanguage();
  const { items: cartItems, isOpen: isCartOpen, openCart, closeCart, removeItem } = useCart();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<ScholarlyArticle | null>(null);

  const categoryOptions = useMemo(() => {
    const totalCount = scholarlyArticlesDatabase.length;
    const getCount = (catName: string) =>
      scholarlyArticlesDatabase.filter(
        (a) => a.category === catName || a.category_fa === catName
      ).length;

    return [
      {
        id: 'all',
        label: dict.catalog_filter_all_categories || dict.ui_all_treatises || 'همه موضوعات',
        count: totalCount,
      },
      {
        id: 'فلسفه',
        label: dict.ui_philosophy,
        count: getCount('فلسفه'),
      },
      {
        id: 'منطق',
        label: dict.ui_logic,
        count: getCount('منطق'),
      },
      {
        id: 'عرفان عملی',
        label: dict.ui_spiritual_wayfaring,
        count: getCount('عرفان عملی'),
      },
    ];
  }, [currentLang, dict]);

  const articles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scholarlyArticlesDatabase.filter((art) => {
      const loc = getLocalizedArticle(art, currentLang);
      const title = (loc?.title || art.title_fa || art.title).toLowerCase();
      const abs = (loc?.abstract || art.abstract_fa || art.abstract).toLowerCase();
      const matchesSearch = !q || title.includes(q) || abs.includes(q);
      const matchesCat =
        selectedCategory === 'all' ||
        art.category === selectedCategory ||
        art.category_fa === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory, currentLang]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#0C0D0E] dark:text-[#FAF8F5] transition-colors pb-10">
      <Navbar
        cartCount={cartItems.length}
        onOpenCart={openCart}
      />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full text-start">
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

          {/* Scholar official identity: حجت الاسلام دکتر زنجیر زن حسینی */}
          <h1 className="text-xl sm:text-2xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5] leading-snug">
            {dict.articles_home_title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {dict.articles_home_desc}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                dict.ui_search_article_titles_abstracts
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-9 pe-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] text-xs outline-none focus:border-[#8A532B]"
            />
          </div>

          <Tabs
            value={selectedCategory}
            onValueChange={(val: string) => {
              triggerTactileHaptic('tick');
              setSelectedCategory(val);
            }}
            className="self-start sm:self-auto"
          >
            <TabsList className="bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] p-1">
              {categoryOptions.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="gap-1.5 text-xs font-bold"
                >
                  <span>{cat.label}</span>
                  <span className="text-[11px] font-mono opacity-60">
                    ({toLocale(cat.count)})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <EmptyStateCard
            title={
              dict.ui_no_matching_articles_found
            }
            description={
              dict.ui_try_clearing_your_search_filter_or_sel
            }
            actionLabel={
              dict.ui_reset_filters
            }
            onActionClick={() => {
              setSearch('');
              setSelectedCategory('all');
            }}
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
