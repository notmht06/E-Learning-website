'use client';

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useData, CouponRecord } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';

export function AdminCouponsTab() {
  const { coupons, addCoupon, toggleCoupon } = useData();
  const { toLocale } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [percent, setPercent] = useState('20');
  const [desc, setDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon: CouponRecord = {
      code: code.trim().toUpperCase(),
      discountPercent: Number(percent) || 10,
      maxUses: 100,
      usedCount: 0,
      expiresAt: '۱۴۰۴/۰۱/۰۱',
      isActive: true,
    };

    addCoupon(newCoupon);
    setIsModalOpen(false);
    setCode('');
    setDesc('');
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            کدهای تخفیف و جوایز دوره‌های علمی
          </h2>
          <p className="text-xs text-zinc-500">
            مدیریت کدهای تخفیف دوره‌های آنلاین و کتاب‌ها
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ایجاد کد تخفیف جدید</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50 dark:bg-zinc-900/50">
                <th className="py-3 px-4 font-normal text-start">کد تخفیف</th>
                <th className="py-3 px-4 font-normal text-start">درصد تخفیف</th>
                <th className="py-3 px-4 font-normal text-start">استفاده</th>
                <th className="py-3 px-4 font-normal text-start">انقضا</th>
                <th className="py-3 px-4 font-normal text-start">وضعیت فعال</th>
                <th className="py-3 px-4 font-normal text-start">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {coupons.map((c) => (
                <tr key={c.code} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {c.code}
                  </td>
                  <td className="py-3 px-4 font-num font-bold text-[#8A532B]">
                    {toLocale(c.discountPercent)}٪
                  </td>
                  <td className="py-3 px-4 font-num text-zinc-600 dark:text-zinc-400">
                    {toLocale(c.usedCount)} از {toLocale(c.maxUses)}
                  </td>
                  <td className="py-3 px-4 font-num text-zinc-600 dark:text-zinc-400">
                    {c.expiresAt}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        c.isActive ? 'bg-[#8A532B]/10 text-[#8A532B]' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {c.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleCoupon(c.code)}
                      className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-[11px] transition cursor-pointer"
                    >
                      {c.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی مجدد'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-start shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                ایجاد کوپن تخفیف جدید
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
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">کد تخفیف (لاتین)</label>
                <input
                  type="text"
                  placeholder="مثلاً: HEKMATE1403"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono outline-none focus:border-[#8A532B] uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">درصد تخفیف (عدد)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">شرح تخفیف</label>
                <input
                  type="text"
                  placeholder="تخفیف ویژه هفته پژوهش حوزه علمیه..."
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
                  ثبت کد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
