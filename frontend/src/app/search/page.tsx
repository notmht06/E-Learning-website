'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  FileText,
  Headphones,
  ArrowUpRight,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CartModal } from '@/components/CartModal';
import { coursesDatabase, scholarlyArticlesDatabase } from '@/lib/data';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

export default function SearchPage() {
  const { currentLang, dict, toLocale, localizeHref } = useLanguage();
  const { items: cartItems, isOpen: isCartOpen, openCart, closeCart, removeItem } = useCart();

  const [query, setQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'articles'>('all');

  const matchedArticles = Object.values(scholarlyArticlesDatabase).filter((a) => {
    const title = (a as any)[`title_${currentLang}`] || a.title_fa || a.title;
    const cat = (a as any)[`category_${currentLang}`] || a.category_fa || a.category || '';
    return (
      title.toLowerCase().includes(query.toLowerCase()) ||
      cat.toLowerCase().includes(query.toLowerCase())
    );
  });

  const matchedCourses = Object.values(coursesDatabase).filter((c) => {
    const title = (c as any)[`title_${currentLang}`] || c.title_fa;
    const instructor = (c as any)[`instructor_${currentLang}`] || c.instructor_fa;
    return (
      title.toLowerCase().includes(query.toLowerCase()) ||
      instructor.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#8A532B]/20 selection:text-[#8A532B] pb-8 bg-[#FAF8F5] dark:bg-[#0C0D0E] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar
        cartCount={cartItems.length}
        onOpenCart={openCart}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full text-start">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {dict.ui_global_search_in_treatises_curricula}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {dict.ui_search_by_titles_concepts_ishraq_asfar}
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <Search className="w-5 h-5 text-zinc-400 absolute start-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              dict.ui_e_g_ishraq_asalat_al_wujud_tashkik_asf
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full ps-11 pe-4 py-3 rounded-xl bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 focus:border-[#8A532B] shadow-xs text-sm outline-none transition font-sans"
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#8A532B] text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {dict.ui_all_results} (
            {toLocale(matchedArticles.length + matchedCourses.length)})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-[#8A532B] text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {dict.nav_courses} ({toLocale(matchedCourses.length)})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('articles')}
            className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-[#8A532B] text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {dict.nav_articles} ({toLocale(matchedArticles.length)})
          </button>
        </div>

        <div className="space-y-3">
          {(activeTab === 'all' || activeTab === 'courses') &&
            matchedCourses.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#8A532B]/10 text-[#8A532B] flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {(c as any)[`title_${currentLang}`] || c.title_fa}
                    </h3>
                    <span className="text-xs text-zinc-500 block">
                      {(c as any)[`instructor_${currentLang}`] || c.instructor_fa} •{' '}
                      {(c as any)[`duration_${currentLang}`] || c.duration_fa}
                    </span>
                  </div>
                </div>
                <Link
                  href={localizeHref(`/courses/${c.id}`)}
                  className="px-3.5 py-2 rounded-lg bg-[#8A532B] hover:bg-[#724424] text-white text-xs sm:text-sm font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>{dict.btn_enroll_course}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}

          {(activeTab === 'all' || activeTab === 'articles') &&
            matchedArticles.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#8A532B]/10 text-[#8A532B] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {(a as any)[`title_${currentLang}`] || a.title_fa || a.title}
                    </h3>
                    <span className="text-xs text-zinc-500 block">
                      {(a as any)[`category_${currentLang}`] || a.category_fa || a.category} •{' '}
                      {(a as any)[`readTime_${currentLang}`] || a.readTime}
                    </span>
                  </div>
                </div>
                <Link
                  href={localizeHref(`/articles/${a.slug}`)}
                  className="px-3.5 py-2 rounded-lg bg-[#8A532B] hover:bg-[#724424] text-white text-xs sm:text-sm font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>{dict.nav_articles}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
        </div>
      </main>

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
