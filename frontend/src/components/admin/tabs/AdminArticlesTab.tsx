'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit3,
  ExternalLink,
  X,
  Upload,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { ScholarlyArticle } from '@/lib/data';
import RichTextCmsEditor from '../RichTextCmsEditor';
import { AdminConfirmDialog } from '../AdminConfirmDialog';

export function AdminArticlesTab() {
  const { articles, addArticle, updateArticle, deleteArticle, categories } = useData();
  const { toLocale, dict } = useLanguage();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ScholarlyArticle | null>(null);

  // Reusable confirmation state replacing native confirm()
  const [articleToDelete, setArticleToDelete] = useState<ScholarlyArticle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [titleFa, setTitleFa] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState('حکمت متعالیه');
  const [author, setAuthor] = useState('حجت الاسلام دکتر زنجیر زن حسینی');
  const [abstractFa, setAbstractFa] = useState('');
  const [contentFa, setContentFa] = useState('');
  const [readTimeFa, setReadTimeFa] = useState('۱۵ دقیقه مطالعه');
  const [pdfUrl, setPdfUrl] = useState('');

  const filteredArticles = (articles || []).filter((art) => {
    const matchesSearch =
      !search ||
      (art.title_fa && art.title_fa.includes(search)) ||
      (art.abstract_fa && art.abstract_fa.includes(search));
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setTitleFa('');
    setTitleAr('');
    setTitleEn('');
    setCategory(categories[0]?.name_fa || 'حکمت متعالیه');
    setAuthor('حجت الاسلام دکتر زنجیر زن حسینی');
    setAbstractFa('');
    setContentFa('');
    setReadTimeFa('۱۵ دقیقه مطالعه');
    setPdfUrl('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (art: ScholarlyArticle) => {
    setEditingArticle(art);
    setTitleFa(art.title_fa || '');
    setTitleAr(art.title_ar || '');
    setTitleEn(art.title_en || '');
    setCategory(art.category || 'حکمت متعالیه');
    setAuthor(art.author || 'حجت الاسلام دکتر زنجیر زن حسینی');
    setAbstractFa(art.abstract_fa || '');
    setContentFa(art.content_fa || '');
    setReadTimeFa(art.readTime_fa || art.readTime || '۱۵ دقیقه مطالعه');
    setPdfUrl(art.pdf_url || '');
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleFa.trim()) return;

    const newArt: ScholarlyArticle = {
      id: `article-${Date.now()}`,
      title: titleFa,
      title_fa: titleFa,
      title_ar: titleAr || titleFa,
      title_en: titleEn || titleFa,
      readTime: readTimeFa,
      readTime_fa: readTimeFa,
      publishDate: new Date().toLocaleDateString('fa-IR'),
      publishDate_fa: new Date().toLocaleDateString('fa-IR'),
      published_at: new Date().toLocaleDateString('fa-IR'),
      abstract: abstractFa,
      abstract_fa: abstractFa,
      abstract_ar: abstractFa,
      abstract_en: abstractFa,
      content_fa: contentFa,
      category,
      category_fa: category,
      author,
      slug: `art-${Date.now()}`,
      pdf_url: pdfUrl || undefined,
    };

    await addArticle(newArt);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !titleFa.trim()) return;

    await updateArticle(editingArticle.id, {
      title_fa: titleFa,
      title_ar: titleAr,
      title_en: titleEn,
      abstract_fa: abstractFa,
      content_fa: contentFa,
      readTime: readTimeFa,
      readTime_fa: readTimeFa,
      category,
      author,
      pdf_url: pdfUrl || undefined,
    });
    setEditingArticle(null);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteArticle(articleToDelete.id);
      setArticleToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در مقالات پژوهشی..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] transition-colors"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <option value="all">همه شاخه‌های پژوهشی</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name_fa}>
                {c.name_fa}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن مقاله پژوهشی جدید</span>
        </button>
      </div>

      {/* Articles Table */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50/80 dark:bg-zinc-900/50">
                <th className="py-3.5 px-4 font-normal text-start">عنوان مقاله</th>
                <th className="py-3.5 px-4 font-normal text-start">شاخه علمی</th>
                <th className="py-3.5 px-4 font-normal text-start">نویسنده</th>
                <th className="py-3.5 px-4 font-normal text-start">تاریخ نشر</th>
                <th className="py-3.5 px-4 font-normal text-start">نسخه PDF</th>
                <th className="py-3.5 px-4 font-normal text-start">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    مقاله پژوهشی با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-sm">
                        {art.title_fa}
                      </span>
                      {art.abstract_fa && (
                        <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                          {art.abstract_fa}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
                        {art.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 font-medium">
                      {art.author || 'حجت الاسلام دکتر زنجیر زن حسینی'}
                    </td>
                    <td className="py-3 px-4 font-num text-zinc-500">
                      {art.published_at || art.publishDate || 'معاصر'}
                    </td>
                    <td className="py-3 px-4">
                      {art.pdf_url ? (
                        <a
                          href={art.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#8A532B] hover:underline font-bold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>دریافت PDF</span>
                        </a>
                      ) : (
                        <span className="text-zinc-400">ندارد</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(art)}
                          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-[#8A532B] hover:text-[#8A532B] transition active:scale-95 cursor-pointer"
                          title="ویرایش مقاله"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setArticleToDelete(art)}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95 cursor-pointer"
                          title="حذف مقاله"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Article Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4 text-start shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                افزودن مقاله و رساله پژوهشی جدید
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  عنوان فارسی مقاله
                </label>
                <input
                  type="text"
                  placeholder="مثال: رساله در برهان امکان و وجوب"
                  value={titleFa}
                  onChange={(e) => setTitleFa(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold outline-none focus:border-[#8A532B] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                    شاخه علمی
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name_fa}>
                        {c.name_fa}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                    نویسنده / پژوهشگر
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  چکیده مقاله
                </label>
                <textarea
                  rows={2}
                  value={abstractFa}
                  onChange={(e) => setAbstractFa(e.target.value)}
                  placeholder="تبیین مقدماتی مسأله و برهان اصلی..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] resize-none leading-relaxed transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    متن تفصیلی و نگارش مقاله (ویرایشگر پیشرفته CMS)
                  </label>
                  <span className="text-[11px] font-bold text-[#8A532B] dark:text-[#C58B43] bg-amber-50 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-zinc-700 font-num">
                    مدت مطالعه برآوردی: {readTimeFa}
                  </span>
                </div>
                <RichTextCmsEditor
                  value={contentFa}
                  onChange={setContentFa}
                  onAutoReadTime={setReadTimeFa}
                  placeholder="متن پژوهش، تحلیل برهانی، تصاویر و مستندات خود را اینجا درج فرمایید..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  پیوند فایل PDF مقاله
                </label>
                <input
                  type="text"
                  placeholder="/articles/burhan_wujub.pdf"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
                >
                  ثبت و انتشار مقاله
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Article Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4 text-start shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                ویرایش مقاله پژوهشی
              </h3>
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  عنوان مقاله
                </label>
                <input
                  type="text"
                  value={titleFa}
                  onChange={(e) => setTitleFa(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold outline-none focus:border-[#8A532B] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                    شاخه علمی
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name_fa}>
                        {c.name_fa}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                    نویسنده
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  چکیده مقاله
                </label>
                <textarea
                  rows={2}
                  value={abstractFa}
                  onChange={(e) => setAbstractFa(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] resize-none leading-relaxed transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    متن تفصیلی و نگارش مقاله (ویرایشگر پیشرفته CMS)
                  </label>
                  <span className="text-[11px] font-bold text-[#8A532B] dark:text-[#C58B43] bg-amber-50 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-zinc-700 font-num">
                    مدت مطالعه برآوردی: {readTimeFa}
                  </span>
                </div>
                <RichTextCmsEditor
                  value={contentFa}
                  onChange={setContentFa}
                  onAutoReadTime={setReadTimeFa}
                  placeholder="متن پژوهش، تحلیل برهانی، تصاویر و مستندات خود را اینجا درج فرمایید..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  پیوند فایل PDF
                </label>
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(articleToDelete)}
        title="تأیید حذف مقاله پژوهشی"
        description={
          articleToDelete ? (
            <span>
              آیا از حذف مقاله «<strong>{articleToDelete.title_fa}</strong>» اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </span>
          ) : null
        }
        confirmLabel="بله، حذف شود"
        cancelLabel="انصراف"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setArticleToDelete(null)}
      />
    </div>
  );
}
