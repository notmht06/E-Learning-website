'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import {
  VibeFarsiHero,
  VibeFarsiMarquee,
  VibeFarsiFAQ,
  CourseCategoryCarousel,
  MethodologyGuarantees,
  RoadmapBannerSection,
  LatestArticlesHomeSection,
} from '@/components/home';
import { CourseCatalogBento } from '@/components/CourseCatalogBento';
import { ScholarDispatchBento } from '@/components/ScholarDispatchBento';
import { CartModal } from '@/components/CartModal';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { useCart } from '@/context/CartContext';
import { getScholarName } from '@/lib/constants';

export default function HomePage() {
  const { currentLang, dict, localizeHref } = useLanguage();
  const { courses, categories, siteConfig } = useData();
  const {
    items: cartItems,
    isOpen: isCartOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
  } = useCart();

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

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#8A532B]/20 selection:text-[#8A532B] dark:selection:text-[#C58B43] bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#18181B] dark:text-[#F4F4F6] transition-colors duration-200 font-sans antialiased">
      {/* 1. Floating Capsule Header Navigation */}
      <Navbar
        cartCount={cartItems.length}
        onOpenCart={openCart}
      />

      {/* 2. Main Content Layout (Clean Editorial Architecture) */}
      <main className="flex-1 space-y-10 sm:space-y-14 pb-16">
        {/* SECTION 1: Masterpiece Hero Banner with Instant Search & CTAs */}
        <VibeFarsiHero />

        {/* SECTION 2: 4 Counter Stats Bar */}
        <VibeFarsiMarquee />

        {/* SECTION 3: 8 Academic Branches Category Carousel */}
        <CourseCategoryCarousel />

        {/* SECTION 4: Featured & Masterpiece Courses Catalog */}
        <CourseCatalogBento
          courses={allCourses}
          categories={categories}
          onAddToCart={handleAddToBag}
        />

        {/* SECTION 5: 6 Core Pillars of Instruction & Guarantees */}
        <MethodologyGuarantees />

        {/* SECTION 6: Comprehensive Learning Roadmap Banner */}
        <RoadmapBannerSection />

        {/* SECTION 7: Scholar Latest Research Articles & Treatises */}
        <LatestArticlesHomeSection />

        {/* SECTION 8: Clean RTL FAQ Accordion */}
        <VibeFarsiFAQ />

        {/* SECTION 9: Scholar Dispatch Newsletter Banner */}
        <ScholarDispatchBento />
      </main>

      {/* Editorial Clean Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#101114] py-8 px-4 sm:px-6 text-start">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-start">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {dict.scholar_full_title || getScholarName(currentLang)}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {siteConfig?.footer_copyright_fa || dict.footer_tagline}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <Link href={localizeHref('/courses')} className="hover:text-[#8A532B] dark:hover:text-[#C58B43] transition duration-200">
              {dict.nav_courses}
            </Link>
            <Link href={localizeHref('/articles')} className="hover:text-[#8A532B] dark:hover:text-[#C58B43] transition duration-200">
              {dict.nav_articles}
            </Link>
            <Link href={localizeHref('/roadmap')} className="hover:text-[#8A532B] dark:hover:text-[#C58B43] transition duration-200">
              {dict.nav_roadmap}
            </Link>
          </div>
        </div>
      </footer>

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
