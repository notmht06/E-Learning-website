'use client';

import React, { useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  ShoppingBag,
} from 'lucide-react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Book } from '@/lib/data';
import { getLocalizedBook, getLocalizedSubject } from '@/lib/localization';
import { triggerTactileHaptic } from '@/lib/haptics';
import { EDITORIAL_SPRING, TACTILE_SPRING } from './MasterpieceCourseCard';

interface MasterpieceBookCardProps {
  book: Book;
  onOpenBookReader?: (bookId: string) => void;
  onAddToCart?: (book: Book) => void;
}

export function MasterpieceBookCard({
  book,
  onOpenBookReader,
  onAddToCart,
}: MasterpieceBookCardProps) {
  const { currentLang, toLocale, dict } = useLanguage();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const cardRef = useRef<HTMLDivElement>(null);

  const locBook = getLocalizedBook(book, currentLang);
  const title = locBook?.title || book.title_fa;
  const desc = locBook?.desc || book.desc_fa;
  const price = locBook?.price || book.price_fa;
  const bookmarked = isBookmarked(book.id);

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

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), EDITORIAL_SPRING);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), EDITORIAL_SPRING);
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const handleRibbonToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerTactileHaptic('ribbon');
    toggleBookmark(book.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={EDITORIAL_SPRING}
      className="bg-[#FAF8F5] dark:bg-[#121316] border border-[#E6E1D8] dark:border-[#22242A] hover:border-[#8A532B]/50 dark:hover:border-[#C58B43]/50 rounded-2xl p-5 flex flex-col justify-between space-y-5 group transition-colors"
    >
      {/* صحنه نمایش ۳بعدی جلد کتاب در قطع وزیری */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          triggerTactileHaptic('thump');
          onOpenBookReader?.(book.id);
        }}
        className="relative h-64 rounded-xl bg-[#F2ECE1] dark:bg-[#0C0D0E] border border-[#E2DACB] dark:border-[#1E2026] flex items-center justify-center p-5 overflow-hidden cursor-pointer perspective-2200 select-none"
      >
        {/* روبان ابریشمی نشان‌گذاری با فیزیک فنری */}
        <motion.button
          type="button"
          onClick={handleRibbonToggle}
          initial={false}
          animate={{ y: bookmarked ? 0 : -14 }}
          whileHover={{ y: bookmarked ? 4 : -6 }}
          whileTap={{ y: 10 }}
          transition={TACTILE_SPRING}
          title={bookmarked ? (dict.catalog_bookmark_remove || 'حذف نشان') : (dict.catalog_bookmark_add || 'نشان‌گذاری این اثر')}
          className={`absolute top-0 start-5 z-20 w-7 h-14 rounded-b-md flex items-end justify-center pb-2 shadow-md cursor-pointer ${
            bookmarked
              ? 'bg-[#8A532B] text-[#FAF8F5]'
              : 'bg-[#0C0D0E]/80 text-zinc-300 hover:bg-[#8A532B] hover:text-white'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
        </motion.button>

        {/* جلد فیزیکی کتاب در قطع وزیری با پالت فاخر چرم، عطف برجسته و طلاکوب */}
        <motion.div
          style={{ rotateX, rotateY }}
          className={`relative w-36 h-52 rounded-e-lg rounded-s-sm ${
            book.id === 'book1'
              ? 'bg-[#241812] border-[#C58B43]'
              : book.id === 'book2'
              ? 'bg-[#131B2B] border-[#D4AF37]'
              : book.id === 'book3'
              ? 'bg-[#14221A] border-[#B87333]'
              : book.id === 'book4'
              ? 'bg-[#25141C] border-[#C58B43]'
              : (book.coverGradient || 'bg-[#241812]') + ' border-[#C58B43]'
          } border p-4 flex flex-col justify-between text-center shadow-[0_18px_35px_-10px_rgba(12,13,14,0.55)] preserve-3d stacked-pages-border-left`}
        >
          {/* شیار عطف جلد سخت */}
          <div className="book-spine-crease" />

          {/* کادر طلاکوب سنتی داخل جلد */}
          <div className="absolute inset-2 border border-[#E6CA85]/25 rounded-sm pointer-events-none" />

          {/* بازتاب نوری ملایم هنگام حرکت ماوس */}
          <motion.div
            style={{ left: glareX }}
            className="pointer-events-none absolute -inset-y-4 w-12 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />

          <span className="text-[9px] font-mono text-[#E6CA85]/80 tracking-widest uppercase block z-10">
            DAR AL-HIKMAH
          </span>

          <div className="my-auto space-y-2 z-10 px-1">
            <h4 className="text-xs sm:text-sm font-bold text-[#FAF8F5] leading-snug line-clamp-3">
              {title}
            </h4>
            <div className="w-8 h-px bg-[#C58B43]/60 mx-auto" />
          </div>

          <span className="text-[9px] font-mono text-[#E6CA85]/75 block z-10 truncate">
            {getFormatBadge()}
          </span>
        </motion.div>
      </div>

      {/* بخش توضیحات تحلیلی و شناسنامه نشر با کپسول قیمت معتبر */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="px-2.5 py-0.5 rounded-md bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] font-bold">
              {getLocalizedSubject(book.subjectCategory || 'حکمت متعالیه', currentLang)}
            </span>
            <span className="font-num font-bold text-xs text-zinc-800 dark:text-zinc-200">
              {price}
            </span>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2 text-justify">
            {desc}
          </p>
        </div>

        {/* شناسنامه فنی چاپ */}
        <div className="pt-2 border-t border-[#ECE8E0] dark:border-[#202228] flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-num">
          <span>ISBN: {toLocale(book.isbn || '978-622-02-1948-1')}</span>
          <span>
            {toLocale(385)}{' '}
            {dict.book_pages_suffix ||
              (currentLang === 'en'
                ? 'Pages (Cream paper)'
                : currentLang === 'ar'
                ? 'صفحة (ورق شمواه)'
                : 'صفحه شاموا')}
          </span>
        </div>
      </div>

      {/* دکمه‌های عملیاتی */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {onOpenBookReader && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            transition={TACTILE_SPRING}
            onClick={() => {
              triggerTactileHaptic('thump');
              onOpenBookReader(book.id);
            }}
            className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#1E2024] hover:bg-[#8A532B]/10 dark:hover:bg-[#25282E] text-[#0C0D0E] dark:text-[#FAF8F5] border border-[#E2DACB] dark:border-[#C58B43]/30 hover:border-[#C58B43] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
            <span className="truncate">{dict.catalog_books_btn_read_3d || dict.btn_quick_read || 'مشاهده نمونه کتاب'}</span>
          </motion.button>
        )}

        {onAddToCart ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            transition={TACTILE_SPRING}
            onClick={() => {
              triggerTactileHaptic('thump');
              onAddToCart(book);
            }}
            className="py-2.5 px-3 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{dict.btn_order_book || 'خرید کتاب'}</span>
          </motion.button>
        ) : (
          <Link
            href={`/books/${book.id}`}
            onClick={() => triggerTactileHaptic('tick')}
            className="py-2.5 px-3 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="truncate">{dict.books_colophon_btn || 'مشاهده و خرید کتاب'}</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 shrink-0" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
