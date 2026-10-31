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
  const { coupons, addCoupon, toggleCoupon, deleteCoupon } = useData();
  const { toLocale, dict } = useLanguage();

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
            {dict.admin_coupons_title}
          </h2>
          <p className="text-xs text-zinc-500">
            {dict.admin_coupons_desc}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{dict.admin_coupons_btn_add}</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50 dark:bg-zinc-900/50">
                <th className="py-3 px-4 font-normal text-start">{dict.admin_coupons_th_code}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_coupons_th_percent}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_coupons_th_usage}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_coupons_th_expires}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_coupons_th_status}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.th_actions}</th>
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
                    {toLocale(c.usedCount)} {dict.ongoing_session_of} {toLocale(c.maxUses)}
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
                      {c.isActive ? dict.admin_coupons_status_active : dict.admin_coupons_status_inactive}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCoupon(c.code)}
                        className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-[11px] transition cursor-pointer"
                      >
                        {c.isActive ? dict.admin_coupons_btn_deactivate : dict.admin_coupons_btn_activate}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`آیا از حذف کوپن تخفیف «${c.code}» مطمئن هستید؟`)) {
                            deleteCoupon(c.code);
                          }
                        }}
                        className="p-1 rounded-lg text-[#8A532B] hover:bg-[#8A532B]/10 transition cursor-pointer"
                        title="حذف کوپن"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                {dict.admin_coupons_modal_title}
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
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">{dict.admin_coupons_field_code}</label>
                <input
                  type="text"
                  placeholder="HEKMATE1403"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono outline-none focus:border-[#8A532B] uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">{dict.admin_coupons_field_percent}</label>
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
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">{dict.admin_coupons_field_desc}</label>
                <input
                  type="text"
                  placeholder="..."
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
                  {dict.admin_categories_btn_cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium"
                >
                  {dict.admin_coupons_btn_submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
