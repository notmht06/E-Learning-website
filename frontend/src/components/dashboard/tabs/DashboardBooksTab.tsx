'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { getScholarName } from '@/lib/constants';

interface DashboardBooksTabProps {
  onOpenReader?: (bookId: string) => void;
}

export function DashboardBooksTab({ onOpenReader }: DashboardBooksTabProps) {
  const { books } = useData();
  const { currentLang, localizeHref } = useLanguage();
  const booksList = Object.values(books);

  const bannerTitle = currentLang === 'en'
    ? 'Specialized Library & Critical Editions'
    : currentLang === 'ar'
    ? 'المكتبة التخصصية والمصنفات المحققة'
    : 'کتابخانه تخصصی و کتب مصحح';

  const bannerSub = currentLang === 'en'
    ? 'Philosophical treatises and monographs with interactive page preview'
    : currentLang === 'ar'
    ? 'المؤلفات والرسائل الفلسفية مع استعراض نماذج الصفحات'
    : 'کتاب‌ها و آثار چاپی فلسفی همراه با مشاهده نمونه صفحات کتاب';

  return (
    <div className="space-y-6 text-start">
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {bannerTitle}
          </h2>
          <p className="text-xs text-zinc-500">
            {bannerSub}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {booksList.map((book) => {
          const bookTitle = currentLang === 'en' && book.title_en
            ? book.title_en
            : (currentLang === 'ar' && book.title_ar ? book.title_ar : book.title_fa);

          const bookAuthor = currentLang === 'en'
            ? `Author: ${book.author_en || getScholarName('en')}`
            : currentLang === 'ar'
            ? `المؤلف: ${book.author_ar || getScholarName('ar')}`
            : `مؤلف: ${book.author_fa || getScholarName('fa')}`;

          const bookFormat = currentLang === 'en'
            ? 'Hardcover Edition'
            : currentLang === 'ar'
            ? 'كتاب ورقي (تجليد فاخر)'
            : (book.formatCategory || 'کتاب چاپی (گالینگور)');

          const bookPrice = currentLang === 'en'
            ? (book.price_en || '$38.00')
            : currentLang === 'ar'
            ? (book.price_ar || book.price_fa)
            : book.price_fa;

          const readerBtnLabel = currentLang === 'en'
            ? '3D Reader'
            : currentLang === 'ar'
            ? 'القارئ ثلاثي الأبعاد'
            : 'ورق‌زن ۳بعدی';

          const viewBtnLabel = currentLang === 'en'
            ? 'View Book'
            : currentLang === 'ar'
            ? 'عرض الكتاب'
            : 'مشاهده اثر';

          return (
            <div
              key={book.id}
              className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8A532B]/40 transition"
            >
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded-full bg-[#8A532B]/10 text-[#8A532B] font-mono text-[11px]">
                  {bookFormat}
                </span>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {bookTitle}
                </h3>
                <p className="text-xs text-zinc-500">
                  {bookAuthor}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-[#8A532B] font-num">{bookPrice}</span>
                <div className="flex items-center gap-2">
                  {onOpenReader && (
                    <button
                      onClick={() => onOpenReader(book.id)}
                      className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                      {readerBtnLabel}
                    </button>
                  )}
                  <Link
                    href={localizeHref(`/books/${book.id}`)}
                    className="px-3 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium transition"
                  >
                    {viewBtnLabel}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
