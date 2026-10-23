'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useData } from '@/context/DataContext';

interface DashboardBooksTabProps {
  onOpenReader?: (bookId: string) => void;
}

export function DashboardBooksTab({ onOpenReader }: DashboardBooksTabProps) {
  const { books } = useData();
  const booksList = Object.values(books);

  return (
    <div className="space-y-6 text-start">
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            کتابخانه تخصصی و کتب مصحح
          </h2>
          <p className="text-xs text-zinc-500">
            کتاب‌ها و آثار چاپی فلسفی همراه با مشاهده نمونه صفحات کتاب
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {booksList.map((book) => (
          <div
            key={book.id}
            className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8A532B]/40 transition"
          >
            <div className="space-y-2">
              <span className="px-2 py-0.5 rounded-full bg-[#8A532B]/10 text-[#8A532B] font-mono text-[11px]">
                {book.formatCategory || 'کتاب چاپی'}
              </span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {book.title_fa}
              </h3>
              <p className="text-xs text-zinc-500">
                مؤلف: {book.author_fa || 'حجت الاسلام دکتر زنجیر زن حسینی'}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-[#8A532B]">{book.price_fa}</span>
              <div className="flex items-center gap-2">
                {onOpenReader && (
                  <button
                    onClick={() => onOpenReader(book.id)}
                    className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    ورق‌زن ۳بعدی
                  </button>
                )}
                <Link
                  href={`/books/${book.id}`}
                  className="px-3 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium transition"
                >
                  مشاهده اثر
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
