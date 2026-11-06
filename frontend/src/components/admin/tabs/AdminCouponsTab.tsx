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
import { AdminConfirmDialog } from '../AdminConfirmDialog';

export function AdminCouponsTab() {
  const { coupons, addCoupon, toggleCoupon, deleteCoupon } = useData();
  const { toLocale, dict } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [percent, setPercent] = useState('20');
  const [desc, setDesc] = useState('');

  const [couponToDelete, setCouponToDelete] = useState<CouponRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCoupon(couponToDelete.code);
      setCouponToDelete(null);
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
            {dict.admin_coupons_title}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {dict.admin_coupons_desc}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer"
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
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50/80 dark:bg-zinc-900/50">
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_coupons_th_code}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_coupons_th_percent}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_coupons_th_usage}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_coupons_th_expires}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_coupons_th_status}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.th_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    هیچ کد تخفیفی ثبت نشده است.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.code} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {c.code}
                    </td>
                    <td className="py-3.5 px-4 font-num font-bold text-[#8A532B]">
                      {toLocale(c.discountPercent)}٪
                    </td>
                    <td className="py-3.5 px-4 font-num text-zinc-600 dark:text-zinc-400">
                      {toLocale(c.usedCount)} {dict.ongoing_session_of} {toLocale(c.maxUses)}
                    </td>
                    <td className="py-3.5 px-4 font-num text-zinc-600 dark:text-zinc-400">
                      {c.expiresAt}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                          c.isActive
                            ? 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/20 dark:text-[#C58B43]'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {c.isActive ? dict.admin_coupons_status_active : dict.admin_coupons_status_inactive}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCoupon(c.code)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition active:scale-95 cursor-pointer"
                        >
                          {c.isActive ? dict.admin_coupons_btn_deactivate : dict.admin_coupons_btn_activate}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCouponToDelete(c)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95 cursor-pointer"
                          title="حذف کوپن"
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

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-start shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {dict.admin_coupons_modal_title}
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
                  {dict.admin_coupons_field_code}
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: ISHRAQ20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-bold outline-none focus:border-[#8A532B] uppercase transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  {dict.admin_coupons_field_percent}
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="20"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] transition-colors"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer"
                >
                  {dict.admin_courses_modal_btn_cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
                >
                  {dict.admin_coupons_btn_submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(couponToDelete)}
        title="تأیید حذف کد تخفیف"
        description={
          couponToDelete ? (
            <span>
              آیا از حذف کد تخفیف «<strong>{couponToDelete.code}</strong>» اطمینان دارید؟
            </span>
          ) : null
        }
        confirmLabel="بله، حذف شود"
        cancelLabel="انصراف"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setCouponToDelete(null)}
      />
    </div>
  );
}
