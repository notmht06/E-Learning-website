'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  X,
  Compass,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { CourseCategory } from '@/lib/data';
import { AdminConfirmDialog } from '../AdminConfirmDialog';

export function AdminCategoriesTab() {
  const { categories, addCategory, deleteCategory } = useData();
  const { dict, toLocale } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameFa, setNameFa] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');

  const [categoryToDelete, setCategoryToDelete] = useState<CourseCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) return;

    const newCat: CourseCategory = {
      id: `cat-${Date.now()}`,
      name: nameFa,
      name_fa: nameFa,
      name_ar: nameFa,
      name_en: slug || nameFa,
      slug: slug || `slug-${Date.now()}`,
      description: desc,
      description_fa: desc,
      description_ar: desc,
      description_en: desc,
      iconName: 'Compass',
    };

    addCategory(newCat);
    setIsModalOpen(false);
    setNameFa('');
    setSlug('');
    setDesc('');
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {dict.admin_categories_title}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {dict.admin_categories_desc}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{dict.admin_categories_btn_add}</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8A532B]/40 transition group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-400 font-num">[ ۰{toLocale(idx + 1)} ]</span>
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(cat)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95 cursor-pointer"
                  title="حذف دسته‌بندی"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] transition-colors">
                {cat.name_fa}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {cat.description_fa || dict.admin_categories_default_desc}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="truncate max-w-[120px]">SLUG: {cat.slug}</span>
              <span className="text-[#8A532B] font-bold">{dict.admin_categories_badge_active}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-start shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {dict.admin_categories_modal_title}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  {dict.admin_categories_field_name}
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: کلام استدلالی"
                  value={nameFa}
                  onChange={(e) => setNameFa(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  {dict.admin_categories_field_slug}
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: kalam"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono outline-none focus:border-[#8A532B] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  {dict.admin_categories_field_desc}
                </label>
                <textarea
                  rows={3}
                  placeholder="کشف المراد، تجرید الاعتقاد و متون پایه..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] resize-none leading-relaxed transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer"
                >
                  {dict.admin_categories_btn_cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
                >
                  {dict.admin_categories_btn_submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        title="تأیید حذف شاخه علمی"
        description={
          categoryToDelete ? (
            <span>
              آیا از حذف شاخه «<strong>{categoryToDelete.name_fa}</strong>» اطمینان دارید؟
            </span>
          ) : null
        }
        confirmLabel="بله، حذف شود"
        cancelLabel="انصراف"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
