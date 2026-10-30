'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ShoppingBag } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { CartModal } from '@/components/CartModal';
import { booksDatabase } from '@/lib/data';
import { getLocalizedBook } from '@/lib/localization';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

const BookReader3D = dynamic(
  () => import('@/components/BookReader3D').then((mod) => mod.BookReader3D),
  { ssr: false }
);

export function BookDetailClient({ bookId }: { bookId: string }) {
  const { books } = useData();
  const book = books[bookId] || books['book1'] || booksDatabase['book1'];

  const { currentLang, dict, localizeHref } = useLanguage();
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);
  const {
    items: cartItems,
    isOpen: isCartOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
  } = useCart();

  const locBook = getLocalizedBook(book, currentLang);
  const title = locBook?.title || book.title_fa;
  const desc = locBook?.desc || book.desc_fa;
  const price = locBook?.price || book.price_fa;
  const badge = locBook?.badge || book.badge_fa;

  const authorCredentials =
    currentLang === 'en'
      ? 'Author & Commentator • Advanced Seminary Studies'
      : currentLang === 'ar'
      ? 'مؤلف وشارح • أستاذ السطوح العليا'
      : 'مؤلف و شارح • مدرس سطوح عالی حوزه';

  const handleAddToBag = () => {
    addItem({
      id: book.id || bookId || 'book-ishraq-1',
      title,
      price,
      type: 'book',
      itemType: 'book_print',
    });
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#8A532B]/20 selection:text-[#8A532B] pb-8 bg-[#FAF8F5] dark:bg-[#0C0D0E] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar
        cartCount={cartItems.length}
        onOpenCart={openCart}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full text-start">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-400">
          <Link href={localizeHref('/')} className="hover:text-[#8A532B]">{dict.nav_home || 'صفحه اصلی'}</Link>
          <span>/</span>
          <Link href={localizeHref('/books')} className="hover:text-[#8A532B]">{dict.nav_books || 'کتب'}</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 line-clamp-1">{title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Book Stage Column */}
          <div className="lg:col-span-5 bg-white dark:bg-[#141518] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 flex flex-col items-center justify-center min-h-[380px] shadow-xs">
            <div className="w-56 h-80 rounded-xl bg-gradient-to-br from-[#8A532B]/20 to-[#C58B43]/10 border border-[#8A532B]/30 flex flex-col justify-between p-6 shadow-lg text-center relative overflow-hidden">
              <span className="text-[10px] font-mono text-[#8A532B] dark:text-[#C58B43] tracking-wider uppercase block">
                [ {book.isbn || '978-600-00-0000-0'} ]
              </span>
              <div className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {title}
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {book.author_fa || 'حجت الاسلام دکتر زنجیر زن حسینی'}
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#8A532B] dark:text-[#C58B43]">
                {(book.pages_count || book.pageCount) ? `${book.pages_count || book.pageCount} صفحه` : 'نسخه چاپی نفیس'}
              </span>
            </div>
          </div>

          {/* Book Details Column */}
          <div className="lg:col-span-7 bg-white dark:bg-[#141518] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20">
                  {badge || 'اثر برگزیده'}
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {book.print_edition || 'چاپ اول • گالینگور'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {authorCredentials}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
              {desc}
            </p>

            {/* Book Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#18191D] border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[11px] text-zinc-400 block mb-1">قطع</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">وزیری</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#18191D] border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[11px] text-zinc-400 block mb-1">نوع جلد</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">سخت (گالینگور)</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#18191D] border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[11px] text-zinc-400 block mb-1">شابک</span>
                <span className="text-[11px] font-mono text-zinc-800 dark:text-zinc-200">{book.isbn || '978-622-00'}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#18191D] border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[11px] text-zinc-400 block mb-1">قیمت نسخه چاپی</span>
                <span className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43]">{price}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsReaderOpen(true)}
                className="px-5 py-2 rounded-lg bg-[#8A532B] hover:bg-[#724424] text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{dict.book_3d_turn || 'ورق‌زن ۳ بعدی'}</span>
              </button>

              <button
                type="button"
                onClick={handleAddToBag}
                className="px-5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs sm:text-sm border border-zinc-200 dark:border-zinc-700 transition flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{dict.btn_order_book || 'سفارش کتاب'} ({price})</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <BookReader3D
        isOpen={isReaderOpen}
        bookId={book.id}
        currentLang={currentLang}
        onClose={() => setIsReaderOpen(false)}
        onAddToBag={handleAddToBag}
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
