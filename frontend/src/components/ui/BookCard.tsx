'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Bookmark, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Book } from '@/lib/data';
import { getLocalizedBook } from '@/lib/localization';
import { useLanguage } from '@/context/LanguageContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { SCHOLAR_NAME } from '@/lib/constants';

interface BookCardProps {
  book: Book;
  onOpenReader?: (id: string) => void;
  onAddToBag?: (title: string, price: string) => void;
}

export function BookCard({ book, onOpenReader, onAddToBag }: BookCardProps) {
  const { currentLang, dict } = useLanguage();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(book.id);

  const loc = getLocalizedBook(book, currentLang);
  const title = loc?.title || book.title_fa;
  const desc = loc?.desc || book.desc_fa;
  const price = loc?.price || book.price_fa;
  const badge = loc?.badge || book.badge_fa;

  const authorCredentials =
    currentLang === 'en'
      ? 'Author & Commentator • Advanced Seminary Studies'
      : currentLang === 'ar'
      ? 'مؤلف وشارح • أستاذ السطوح العليا'
      : 'مؤلف و شارح • مدرس سطوح عالی حوزه';

  const read3DText =
    currentLang === 'en'
      ? (dict.book_3d_turn || 'Preview Book')
      : currentLang === 'ar'
      ? (dict.book_3d_turn || 'تصفح الكتاب')
      : (dict.book_3d_turn || 'ورق زدن کتاب');

  const orderText =
    currentLang === 'en'
      ? (dict.btn_order_book || 'Order Book')
      : currentLang === 'ar'
      ? (dict.btn_order_book || 'طلب الكتاب')
      : (dict.btn_order_book || 'سفارش کتاب');

  return (
    <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#8A532B]/40 dark:hover:border-[#C58B43]/40 transition duration-200 flex flex-col justify-between space-y-4 group">
      
      {/* Visual Cover Preview (16:9 / editorial aspect) */}
      <div className={`relative aspect-video rounded-xl overflow-hidden ${book.coverGradient || 'bg-[#141518] '} border border-[#E6CA85]/30 p-4 flex flex-col justify-between text-center select-none shadow-xs group/cover`}>
        
        {/* Subtle Decorative Inner Border */}
        <div className="absolute inset-2 border border-[#E6CA85]/20 rounded-lg pointer-events-none" />

        {/* Bookmark Button with backdrop-blur-sm */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(book.id);
          }}
          className="absolute top-3 start-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition cursor-pointer active:scale-95 z-10"
          title={bookmarked ? (dict.catalog_bookmark_remove || 'حذف نشانک') : (dict.catalog_bookmark_add || 'افزودن نشانک')}
          aria-label={bookmarked ? 'حذف نشانک' : 'افزودن نشانک'}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current text-[#C58B43]' : ''}`} />
        </button>

        {/* High-Contrast WCAG AAA Price Pill */}
        <div className="absolute bottom-3 end-3 z-10 px-3 py-1 rounded-full bg-[#0C0D0E]/90 dark:bg-[#FAF8F5]/95 text-[#FAF8F5] dark:text-[#0C0D0E] border border-[#8A532B]/40 text-xs font-bold font-num shadow-sm">
          {price}
        </div>

        {/* Cover Content Centerpiece */}
        <div className="my-auto space-y-1.5 z-10 px-8 pb-5 pt-3">
          <span className="text-[10px] font-mono text-[#E6CA85]/80 block tracking-wider">
            {dict.brand_sub || 'انتشارات حیات'}
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#FFF8EB] drop-shadow-sm line-clamp-1">
            {title}
          </h4>
          <span className="text-[11px] text-[#E6CA85]/90 block truncate">
            {dict.scholar_name || SCHOLAR_NAME}
          </span>
        </div>

        {/* 3D Reader Quick Trigger Overlay on Hover */}
        {onOpenReader && (
          <button
            type="button"
            onClick={() => onOpenReader(book.id)}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center text-[#E6CA85] cursor-pointer z-10 gap-2 text-xs font-bold"
          >
            <div className="px-3 py-2 rounded-full bg-black/70 backdrop-blur-sm border border-[#E6CA85]/40 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{read3DText}</span>
            </div>
          </button>
        )}
      </div>

      {/* Badges & Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="px-3 py-0.5 rounded-full bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] font-mono text-[11px] font-medium">
            {book.subjectCategory || 'حکمت و فلسفه'}
          </span>
          <span className="text-zinc-400 font-mono text-[11px] truncate max-w-36">
            {badge}
          </span>
        </div>

        <Link href={`/books/${book.id}`} className="block group/title">
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover/title:text-[#8A532B] dark:group-hover/title:text-[#C58B43] transition">
            {title}
          </h3>
        </Link>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed text-justify">
          {desc}
        </p>
      </div>

      {/* Clean Instructor / Author Footer Row with Circular Avatar and Credentials */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/images/ostad_zanjirzan.jpg"
            alt={dict.scholar_name || SCHOLAR_NAME}
            className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
          />
          <div className="min-w-0">
            <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {dict.scholar_name || SCHOLAR_NAME}
            </span>
            <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {authorCredentials}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenReader && (
            <button
              type="button"
              onClick={() => onOpenReader(book.id)}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title={read3DText}
              aria-label={read3DText}
            >
              <BookOpen className="w-4 h-4" />
            </button>
          )}

          {onAddToBag ? (
            <button
              type="button"
              onClick={() => onAddToBag(title, price)}
              className="px-4 py-2 rounded-full bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-medium shadow-xs transition flex items-center gap-1 cursor-pointer"
              title={orderText}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{orderText}</span>
            </button>
          ) : (
            <Link
              href={`/books/${book.id}`}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition group/booklink"
              title={orderText}
              aria-label={orderText}
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 rtl:group-hover/booklink:-translate-x-1 ltr:group-hover/booklink:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}
