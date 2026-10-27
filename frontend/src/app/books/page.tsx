'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BookReader3D } from '@/components/BookReader3D';
import { CartModal } from '@/components/CartModal';
import { BookCard } from '@/components/ui/BookCard';
import { CategoryTabStrip, TabItem } from '@/components/ui/CategoryTabStrip';
import { CompactHorizontalCard } from '@/components/ui/CompactHorizontalCard';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { getLocalizedBook } from '@/lib/localization';

export default function BooksPage() {
  const { currentLang, dict, toLocale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBookId, setSelectedBookId] = useState('book1');
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const {
    items: cartItems,
    isOpen: isCartOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
  } = useCart();

  const { books: liveBooks } = useData();
  const allBooksList = useMemo(() => Object.values(liveBooks), [liveBooks]);

  // Multilingual Strings
  const t = useMemo(() => {
    if (currentLang === 'en') {
      return {
        breadcrumb_home: dict.nav_home || 'Home',
        breadcrumb_current: dict.nav_books || 'Publications & Printed Books',
        page_title: dict.catalog_books_page_title || 'Monographs, Treatises & Philosophical Works',
        page_subtitle:
          dict.catalog_books_page_subtitle ||
          'Collection of scholarly treatises, research volumes, and manuscripts authored by Hojjat al-Islam Dr. Zanjirzan Hosseini.',
        search_ph: dict.catalog_search_books_ph || 'Search in book titles and treatises...',
        all_categories: 'All Categories',
        books_count_suffix: 'Titles',
        empty_title: 'No books found',
        empty_desc: 'Please try searching with different keywords or categories.',
        featured_eyebrow: '[ Rare Monographs & Seminal Publications ]',
        featured_title: dict.catalog_featured_heading || 'Featured Monographs & Editions',
      };
    }
    if (currentLang === 'ar') {
      return {
        breadcrumb_home: dict.nav_home || 'الرئيسية',
        breadcrumb_current: dict.nav_books || 'المنشورات والكتب المطبوعة',
        page_title: dict.catalog_books_page_title || 'الرسائل والمونوغرافات والمصنفات الفلسفية',
        page_subtitle:
          dict.catalog_books_page_subtitle ||
          'مجموعة الرسائل والكتب والمصنفات البحثية من تأليف حجة الإسلام الدكتور زنجير زن حسيني.',
        search_ph: dict.catalog_search_books_ph || 'البحث في عناوين الكتب والرسائل...',
        all_categories: 'جميع الأبواب',
        books_count_suffix: 'عنوان كتاب',
        empty_title: 'لم يتم العثور على مصنفات',
        empty_desc: 'يرجى تجربة كلمات بحث یا دسته‌بندی‌های دیگر.',
        featured_eyebrow: '[ الرسائل والمونوغرافات البارزة ]',
        featured_title: dict.catalog_featured_heading || 'المصنفات البارزة والطبعات الخاصة',
      };
    }
    return {
      breadcrumb_home: dict.nav_home || 'صفحه اصلی',
      breadcrumb_current: dict.nav_books || 'کتاب‌ها و آثار چاپی',
      page_title: dict.catalog_books_page_title || 'کتاب‌ها و آثار چاپی',
      page_subtitle:
        dict.catalog_books_page_subtitle ||
        'مجموعه کتاب‌ها و آثار پژوهشی به قلم حجت الاسلام دکتر زنجیر زن حسینی.',
      search_ph: dict.catalog_search_books_ph || 'جستجو در عناوین کتب و رسائل...',
      all_categories: 'همه موضوعات',
      books_count_suffix: 'عنوان کتاب',
      empty_title: 'کتابی یافت نشد',
      empty_desc: 'لطفاً عبارات جستجو یا دسته‌بندی‌های دیگر را امتحان کنید.',
      featured_eyebrow: '[ رسائل برگزیده و نسخ ویژه ]',
      featured_title: dict.catalog_featured_heading || 'مونوگراف‌های شاخص و آثار چاپی',
    };
  }, [currentLang, dict]);

  // Categories list with counts for CategoryTabStrip
  const categoryTabs: TabItem[] = useMemo(() => {
    const allTab: TabItem = {
      id: 'all',
      label: t.all_categories,
      count: allBooksList.length,
    };

    const uniqueCats = Array.from(new Set(allBooksList.map((b) => b.subjectCategory).filter((cat): cat is string => Boolean(cat))));
    const catTabs = uniqueCats.map((catName) => {
      const count = allBooksList.filter((b) => b.subjectCategory === catName).length;
      return {
        id: catName,
        label: catName,
        count,
      };
    });

    return [allTab, ...catTabs];
  }, [allBooksList, t.all_categories]);

  // Filtered Books List
  const books = useMemo(() => {
    return allBooksList.filter((b) => {
      const loc = getLocalizedBook(b, currentLang);
      const title = (loc?.title || b.title_fa || '').toLowerCase();
      const desc = (loc?.desc || b.desc_fa || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || title.includes(q) || desc.includes(q);
      const matchesCat = selectedCategory === 'all' || b.subjectCategory === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [allBooksList, currentLang, searchQuery, selectedCategory]);

  // Featured Books (first 2-3 books)
  const featuredBooks = useMemo(() => {
    return allBooksList.slice(0, 3);
  }, [allBooksList]);

  const handleOpenReader = (id: string) => {
    setSelectedBookId(id);
    setIsReaderOpen(true);
  };

  const handleAddToBag = (title: string, price: string) => {
    addItem({
      id: `book-${Date.now()}`,
      title,
      price,
      type: 'book',
      itemType: 'book_print',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-zinc-900 dark:text-zinc-100 transition-colors pb-8">
      {/* Navbar */}
      <Navbar
        cartCount={cartItems.length}
        onOpenCart={openCart}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full text-start">
        {/* Header */}
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

        {/* Search Bar & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.search_ph}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-8 pe-4 py-2 rounded-full bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] transition"
            />
          </div>

          <span className="text-xs font-mono text-zinc-400 font-num">
            {toLocale(books.length)} {t.books_count_suffix}
          </span>
        </div>

        {/* Active Category Tab Strip with Minimal Underlines */}
        {categoryTabs.length > 1 && (
          <div className="pt-2">
            <CategoryTabStrip
              tabs={categoryTabs}
              activeTab={selectedCategory}
              onChange={setSelectedCategory}
              ariaLabel="دسته‌بندی موضوعی کتب"
            />
          </div>
        )}

        {/* Books Grid */}
        {books.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((b) => (
              <BookCard
                key={b.id}
                book={b}
                onOpenReader={handleOpenReader}
                onAddToBag={handleAddToBag}
              />
            ))}
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
        {featuredBooks.length > 0 && (
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
              {featuredBooks.map((fb) => (
                <CompactHorizontalCard key={`featured-book-${fb.id}`} book={fb} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={closeCart}
        items={cartItems}
        onRemoveItem={removeItem}
      />

      {/* 3D Book Reader Modal */}
      {isReaderOpen && (
        <BookReader3D
          bookId={selectedBookId}
          isOpen={isReaderOpen}
          currentLang={currentLang}
          onClose={() => setIsReaderOpen(false)}
        />
      )}
    </div>
  );
}
