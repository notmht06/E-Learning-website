'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Bookmark, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Book } from '@/lib/data';
import { getLocalizedBook, getLocalizedSubject } from '@/lib/localization';
import { useLanguage } from '@/context/LanguageContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { SCHOLAR_NAME } from '@/lib/constants';

interface BookCardProps {
  book: Book;
  onOpenReader?: (id: string) => void;
  onAddToBag?: (title: string, price: string) => void;
}

export function BookCard({ book, onOpenReader, onAddToBag }: BookCardProps) {
  const { currentLang, dict, toLocale } = useLanguage();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(book.id);

  const loc = getLocalizedBook(book, currentLang);
  const title = loc?.title || book.title_fa;
  const desc = loc?.desc || book.desc_fa;
  const price = loc?.price || book.price_fa;
  const badge = loc?.badge || book.badge_fa;

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

  // Bespoke Leather Palette mapping per book specification
  const getLeatherStyles = () => {
    switch (book.id) {
      case 'book1':
        return {
          bg: 'bg-[#241812]',
          borderColor: 'border-[#C58B43]',
          innerBorderColor: 'border-[#C58B43]/40',
          accentColor: '#C58B43',
          foilColor: 'text-[#E6CA85]',
          subFoilColor: 'text-[#C58B43]',
          decorStyle: 'geometric',
        };
      case 'book2':
        return {
          bg: 'bg-[#131B2B]',
          borderColor: 'border-[#D4AF37]',
          innerBorderColor: 'border-[#D4AF37]/45',
          accentColor: '#D4AF37',
          foilColor: 'text-[#F5E6B3]',
          subFoilColor: 'text-[#D4AF37]',
          decorStyle: 'cartouche',
        };
      case 'book3':
        return {
          bg: 'bg-[#14221A]',
          borderColor: 'border-[#B87333]',
          innerBorderColor: 'border-[#B87333]/45',
          accentColor: '#B87333',
          foilColor: 'text-[#ECD7C0]',
          subFoilColor: 'text-[#B87333]',
          decorStyle: 'filigree',
        };
      case 'book4':
      default:
        return {
          bg: 'bg-[#25141C]',
          borderColor: 'border-[#C58B43]',
          innerBorderColor: 'border-[#C58B43]/40',
          accentColor: '#C58B43',
          foilColor: 'text-[#FAF8F5]',
          subFoilColor: 'text-[#C58B43]',
          decorStyle: 'gilded',
        };
    }
  };

  const leather = getLeatherStyles();

  // Localized Format Category Badge
  const getFormatBadge = () => {
    switch (book.id) {
      case 'book1':
        return dict.book_format_hardcover || (currentLang === 'en' ? 'Royal Octavo • Hardcover Edition' : currentLang === 'ar' ? 'القطع الوزيري • غلاف مجلد فاخر' : 'قطع وزیری • جلد سخت (گالینگور)');
      case 'book2':
        return dict.book_format_leather || (currentLang === 'en' ? 'Imperial Octavo • Leather Bound' : currentLang === 'ar' ? 'القطع السلطاني • غلاف جلد طبيعي' : 'قطع سلطانی • جلد چرم طبیعی');
      case 'book3':
        return dict.book_format_paperback || (currentLang === 'en' ? 'Crown Octavo • Fine Paperback' : currentLang === 'ar' ? 'القطع الرقعي • غلاف ورقي فاخر' : 'قطع رقعی • شومیز نفیس');
      case 'book4':
      default:
        return dict.book_format_vaziri || (currentLang === 'en' ? 'Royal Octavo • Gilded Hardcover' : currentLang === 'ar' ? 'القطع الوزيري • طبعة فاخرة مذهبة' : 'قطع وزیری • جلد گالینگور طلاکوب');
    }
  };

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#121316] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#8A532B]/50 dark:hover:border-[#C58B43]/50 transition duration-200 flex flex-col justify-between space-y-4 group">
      
      {/* 3D Physical Leather Volume Scene (High-Contrast, Textured, No Supermarket Price Pill) */}
      <div
        className="relative h-64 sm:h-72 rounded-xl bg-[#F0EAE1] dark:bg-[#0C0D0E] border border-[#E2DACB] dark:border-[#1E2026] flex items-center justify-center p-4 overflow-hidden select-none group/cover cursor-pointer"
        onClick={() => onOpenReader?.(book.id)}
      >
        {/* Bookmark Ribbon */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(book.id);
          }}
          className={`absolute top-0 start-4 z-20 w-7 h-11 rounded-b-md flex items-end justify-center pb-2 shadow-md cursor-pointer transition-transform duration-150 active:scale-95 ${
            bookmarked
              ? 'bg-[#8A532B] text-[#FAF8F5]'
              : 'bg-[#0C0D0E]/80 text-zinc-300 hover:bg-[#8A532B] hover:text-white'
          }`}
          title={bookmarked ? (dict.catalog_bookmark_remove || 'حذف نشانک') : (dict.catalog_bookmark_add || 'افزودن نشانک')}
          aria-label={bookmarked ? 'حذف نشانک' : 'افزودن نشانک'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* Bespoke 3D Leather Book Cover */}
        <div
          className={`relative w-40 h-56 rounded-e-lg rounded-s-xs ${leather.bg} border ${leather.borderColor} p-4 flex flex-col justify-between text-center shadow-[0_16px_36px_-10px_rgba(12,13,14,0.6)] group-hover/cover:scale-[1.03] transition-transform duration-300 preserve-3d stacked-pages-border-left`}
        >
          {/* Hardcover Spine Crease & Texture Line */}
          <div className="book-spine-crease" />

          {/* Embossed Classical Inner Frame with Corner Cartouches */}
          <div className={`absolute inset-2 border ${leather.innerBorderColor} rounded-xs pointer-events-none`}>
            {/* Corner Ornaments */}
            <span className="absolute -top-1 -start-1 w-2 h-2 border-t border-s border-[#E6CA85]" />
            <span className="absolute -top-1 -end-1 w-2 h-2 border-t border-e border-[#E6CA85]" />
            <span className="absolute -bottom-1 -start-1 w-2 h-2 border-b border-s border-[#E6CA85]" />
            <span className="absolute -bottom-1 -end-1 w-2 h-2 border-b border-e border-[#E6CA85]" />
          </div>

          {/* Top Imprint */}
          <span className={`text-[9px] font-mono tracking-widest uppercase block z-10 ${leather.foilColor}`}>
            DAR AL-HIKMAH
          </span>

          {/* Center Titlepiece */}
          <div className="my-auto space-y-2 z-10 px-1">
            <h4 className="text-xs sm:text-sm font-bold text-[#FAF8F5] leading-snug line-clamp-3 drop-shadow-sm">
              {title}
            </h4>
            <div className="w-8 h-px bg-[#C58B43]/70 mx-auto" />
            <span className={`text-[10px] block font-medium ${leather.subFoilColor} line-clamp-1`}>
              {dict.scholar_name || SCHOLAR_NAME}
            </span>
          </div>

          {/* Bottom Binding Spec on Cover */}
          <span className={`text-[9px] font-mono block z-10 truncate ${leather.foilColor}`}>
            {getFormatBadge()}
          </span>

          {/* 3D Reader Quick Trigger Hover Overlay */}
          {onOpenReader && (
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center text-[#E6CA85] z-20 rounded-e-lg rounded-s-xs">
              <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-xs border border-[#E6CA85]/40 flex items-center gap-1.5 text-xs font-bold shadow-lg">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{read3DText}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editorial Metadata Box (Cleanly positioned below 3D volume, replacing ugly price pill) */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Format Badge & Subject Category */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded-md bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] font-bold text-[11px]">
              {getLocalizedSubject(book.subjectCategory || 'حکمت و فلسفه', currentLang)}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 font-num font-bold text-xs">
              {price}
            </span>
          </div>

          <Link href={`/books/${book.id}`} className="block group/title">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover/title:text-[#8A532B] dark:group-hover/title:text-[#C58B43] transition">
              {title}
            </h3>
          </Link>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed text-justify">
            {desc}
          </p>
        </div>

        {/* Edition & Scholar Details */}
        <div className="pt-2.5 border-t border-[#ECE8E0] dark:border-[#202228] flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="truncate max-w-[140px] font-mono text-[10px]">
            {getFormatBadge()}
          </span>
          <span className="font-num text-[10px] text-zinc-400">
            {toLocale(book.isbn || '978-622-02-1948-1')}
          </span>
        </div>
      </div>

      {/* Action Buttons (Anti-Glare in dark mode) */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
        {onOpenReader && (
          <button
            type="button"
            onClick={() => onOpenReader(book.id)}
            className="py-2 px-2.5 rounded-xl bg-white dark:bg-[#1E2024] hover:bg-[#8A532B]/10 dark:hover:bg-[#25282E] text-zinc-800 dark:text-[#FAF8F5] border border-[#E2DACB] dark:border-[#C58B43]/30 hover:border-[#C58B43] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            title={read3DText}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
            <span className="truncate">{read3DText}</span>
          </button>
        )}

        {onAddToBag ? (
          <button
            type="button"
            onClick={() => onAddToBag(title, price)}
            className="py-2 px-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            title={orderText}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{orderText}</span>
          </button>
        ) : (
          <Link
            href={`/books/${book.id}`}
            className="py-2 px-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 text-center group/btn"
          >
            <span className="truncate">{orderText}</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 rtl:group-hover/btn:-translate-x-0.5 ltr:group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        )}
      </div>

    </div>
  );
}
