'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Package,
  Layers,
  X,
} from 'lucide-react';
import { useData, ExtendedBook } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { booksDatabase } from '@/lib/data';

export function AdminBooksTab() {
  const { books, addBook, deleteBook } = useData();
  const { toLocale, dict } = useLanguage();

  const [search, setSearch] = useState('');
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  // New Book State
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('حجت الاسلام دکتر زنجیر زن حسینی');
  const [newCategory, setNewCategory] = useState('حکمت متعالیه');
  const [newPrice, setNewPrice] = useState('۳۵۰,۰۰۰ تومان');
  const [newStock, setNewStock] = useState('50');
  const [newIsbn, setNewIsbn] = useState('978-600-1234-56-7');

  const booksList = Object.values(books).filter((b) => {
    return !search || b.title_fa.includes(search);
  });

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const id = `book-${Date.now()}`;
    const base = booksDatabase['book1'] || Object.values(booksDatabase)[0];
    const newBook: ExtendedBook = {
      ...base,
      id,
      title_fa: newTitle,
      title_ar: newTitle,
      title_en: newTitle,
      author_fa: newAuthor,
      author_ar: newAuthor,
      author_en: 'Hujjat al-Islam Dr. Zanjirzan Hosseini',
      formatCategory: 'کتاب چاپی (گالینگور طلاکوب)',
      subjectCategory: newCategory,
      desc_fa: `کتاب تالیف ${newAuthor} چاپ‌شده بر روی کاغذ سوئدی ۷۰ گرم بالکی.`,
      price_fa: newPrice,
      price_ar: newPrice,
      price_en: '$25.00',
      stock: Number(newStock) || 50,
      isbn: newIsbn,
      category_fa: newCategory,
      pageCount: 320,
    };

    addBook(newBook);
    setIsAddBookModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={dict.admin_books_search_placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-8 pe-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
          />
        </div>

        <button
          onClick={() => setIsAddBookModalOpen(true)}
          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{dict.admin_books_btn_add}</span>
        </button>
      </div>

      {/* Books Table */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50 dark:bg-zinc-900/50">
                <th className="py-3 px-4 font-normal text-start">{dict.admin_books_th_title}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_books_th_author}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_books_th_isbn}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_books_th_stock}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_books_th_price}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_books_th_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {booksList.map((book) => (
                <tr key={book.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                    {book.title_fa}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {book.author_fa || 'حجت الاسلام دکتر زنجیر زن حسینی'}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500">
                    {book.isbn || '1403-ZAN-PUB'}
                  </td>
                  <td className="py-3 px-4 font-num">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {toLocale(book.stock || 50)} {dict.admin_books_unit_copies}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#8A532B]">
                    {book.price_fa}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        if (confirm(`${dict.admin_books_confirm_delete} (${book.title_fa})`)) {
                          deleteBook(book.id);
                        }
                      }}
                      className="p-1 rounded-lg text-[#8A532B] hover:bg-[#8A532B]/10 dark:hover:bg-[#C58B43]/20 transition cursor-pointer"
                      title={dict.admin_books_btn_delete_tooltip}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Book Modal */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-start shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {dict.admin_books_modal_title}
              </h3>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">{dict.admin_books_field_title}</label>
                <input
                  type="text"
                  placeholder="مثال: کتاب برهان صدیقین"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">{dict.admin_books_field_author}</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">{dict.admin_books_field_category}</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">{dict.admin_books_field_price}</label>
                  <input
                    type="text"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">{dict.admin_books_field_stock}</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">{dict.admin_books_field_isbn}</label>
                  <input
                    type="text"
                    value={newIsbn}
                    onChange={(e) => setNewIsbn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 space-y-1">
                <span className="font-mono text-[11px] text-[#8A532B] block">{dict.admin_books_spec_label}</span>
                <p>{dict.admin_books_spec_value}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  {dict.admin_categories_btn_cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium"
                >
                  {dict.admin_books_btn_submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
