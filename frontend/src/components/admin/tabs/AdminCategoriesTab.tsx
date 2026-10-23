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
import { CourseCategory } from '@/lib/data';

export function AdminCategoriesTab() {
  const { categories, addCategory, deleteCategory } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameFa, setNameFa] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');

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

  return (
    <div className="space-y-6 text-start">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            دسته‌بندی‌ها و شاخه‌های هشت‌گانه علوم عقلی و نقلی
          </h2>
          <p className="text-xs text-zinc-500">
            ساماندهی منظومه آموزشی و مباحثات تخصصی حیات
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن شاخه علمی</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8A532B]/40 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-400">[ ۰{idx + 1} ]</span>
                <button
                  onClick={() => {
                    if (confirm(`آیا از حذف شاخه «${cat.name_fa}» مطمئن هستید؟`)) {
                      deleteCategory(cat.id);
                    }
                  }}
                  className="text-zinc-400 hover:text-[#8A532B] transition cursor-pointer"
                  title="حذف دسته‌بندی"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {cat.name_fa}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {cat.description_fa || 'مبانی و متون بنیادین این شاخه علمی'}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>SLUG: {cat.slug}</span>
              <span className="text-[#8A532B]">فعال</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-start shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                تعریف شاخه علمی جدید
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">نام شاخه (فارسی)</label>
                <input
                  type="text"
                  placeholder="مثلاً: کلام استدلالی"
                  value={nameFa}
                  onChange={(e) => setNameFa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">شناسه یکتا (Slug انگلیسی)</label>
                <input
                  type="text"
                  placeholder="مثلاً: kalam"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">توضیح کوتاه و متون مرجع</label>
                <textarea
                  rows={3}
                  placeholder="کشف المراد، تجرید الاعتقاد و متون پایه..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium"
                >
                  ثبت شاخه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
