'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { BentoHero } from '@/components/BentoHero';
import { CourseCatalogBento } from '@/components/CourseCatalogBento';
import { ScholarDispatchBento } from '@/components/ScholarDispatchBento';
import { BookReader3D } from '@/components/BookReader3D';
import { CartModal } from '@/components/CartModal';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { useCart } from '@/context/CartContext';
import { booksDatabase } from '@/lib/data';

export default function HomePage() {
  const { currentLang, dict } = useLanguage();
  const { courses, categories } = useData();
  const {
    items: cartItems,
    isOpen: isCartOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
  } = useCart();

  // Modals state
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('book1');

  const handleOpenReader = (bookId: string) => {
    setSelectedBookId(bookId);
    setIsReaderOpen(true);
  };

  const handleAddToBag = (book: any) => {
    addItem({
      id: book.id || `book-${Date.now()}`,
      title: book.title_fa || book.title,
      price: book.price_fa || book.price,
      type: 'book',
      itemType: 'book_physical',
    });
  };

  const allCourses = Object.values(courses);
  const featuredBook = booksDatabase[selectedBookId] || booksDatabase['book1'];

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#8A532B]/20 selection:text-[#8A532B] dark:selection:text-[#C58B43] bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#18181B] dark:text-[#F4F4F6] transition-colors duration-200 font-sans antialiased">
      {/* 1. Main Navigation Bar */}
      <Navbar
        cartCount={cartItems.length}
        onOpenCart={openCart}
      />

      {/* 2. Main Content Layout (Clean Minimal Sirus & Shadcn Scale) */}
      <main className="flex-1 space-y-8 sm:space-y-8 pb-8">
        {/* SECTION 1: Clean Scholar Hero */}
        <BentoHero />

        {/* SECTION 2: Minimal Course & Book Catalog */}
        <CourseCatalogBento
          courses={allCourses}
          categories={categories}
          onOpenBookReader={handleOpenReader}
          onAddToCart={handleAddToBag}
        />

        {/* SECTION 3: Minimal Newsletter / Dispatch */}
        <ScholarDispatchBento />
      </main>

      {/* Editorial Clean Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#101114] py-8 px-4 sm:px-6 text-start">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-start">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              حجت الاسلام دکتر زنجیر زن حسینی
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {dict.footer_tagline || 'حیات • پایگاه رسمی نشر آثار، دروس و تقریرات علوم عقلی و نقلی'}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <Link href="/courses" className="hover:text-[#8A532B] dark:hover:text-[#C58B43] transition duration-200">
              {dict.nav_courses || 'دوره‌ها'}
            </Link>
            <Link href="/books" className="hover:text-[#8A532B] dark:hover:text-[#C58B43] transition duration-200">
              {dict.nav_books || 'کتب'}
            </Link>
            <Link href="/articles" className="hover:text-[#8A532B] dark:hover:text-[#C58B43] transition duration-200">
              {dict.nav_articles || 'مقالات علمی'}
            </Link>
            <Link href="/roadmap" className="hover:text-[#8A532B] dark:hover:text-[#C58B43] transition duration-200">
              {dict.nav_roadmap || 'سیر مطالعاتی'}
            </Link>
          </div>
        </div>
      </footer>

      {/* 3D Book Reader Modal */}
      <BookReader3D
        isOpen={isReaderOpen}
        bookId={selectedBookId}
        currentLang={currentLang}
        onClose={() => setIsReaderOpen(false)}
        onAddToBag={() => handleAddToBag(featuredBook)}
      />

      {/* Cart Drawer */}
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
