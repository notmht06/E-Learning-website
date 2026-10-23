'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Package,
  Printer,
  Copy,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { useData, OrderRecord } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';

export function AdminOrdersTab() {
  const { orders, updateOrderTracking } = useData();
  const { toLocale } = useLanguage();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'همه' | 'در حال پردازش' | 'ارسال‌شده' | 'تحویل مشتری'>('همه');
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<OrderRecord | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      !search ||
      ord.customer.includes(search) ||
      ord.phone.includes(search) ||
      ord.id.includes(search);
    const matchesStatus = statusFilter === 'همه' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTrackingId(code);
    setTimeout(() => setCopiedTrackingId(null), 2000);
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو با نام، شماره، شناسه..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-8 pe-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none text-zinc-700 dark:text-zinc-300"
          >
            <option value="همه">همه وضعیت‌ها</option>
            <option value="در حال پردازش">در حال پردازش</option>
            <option value="ارسال‌شده">ارسال‌شده (پست پیشتاز)</option>
            <option value="تحویل مشتری">تحویل مشتری</option>
          </select>
        </div>

        <div className="text-xs text-zinc-500 font-mono">
          <span>تعداد سفارشات: </span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200 font-num">
            {toLocale(filteredOrders.length)}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50 dark:bg-zinc-900/50">
                <th className="py-3 px-4 font-normal text-start">شناسه فاکتور</th>
                <th className="py-3 px-4 font-normal text-start">سفارش‌دهنده</th>
                <th className="py-3 px-4 font-normal text-start">عنوان اثر / دوره</th>
                <th className="py-3 px-4 font-normal text-start">مبلغ کل</th>
                <th className="py-3 px-4 font-normal text-start">وضعیت مرسوله</th>
                <th className="py-3 px-4 font-normal text-start">کد رهگیری ۲۴ رقمی</th>
                <th className="py-3 px-4 font-normal text-start">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                  <td className="py-3 px-4 font-mono text-zinc-500">{ord.id}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{ord.customer}</span>
                    <span className="font-mono text-[11px] text-zinc-400 block">{ord.phone}</span>
                  </td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 font-medium">
                    {ord.item}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#8A532B]">
                    {ord.total}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={ord.status}
                      onChange={(e) =>
                        updateOrderTracking(ord.id, ord.trackingCode, e.target.value as any)
                      }
                      className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] outline-none"
                    >
                      <option value="در حال پردازش">در حال پردازش</option>
                      <option value="ارسال‌شده">ارسال‌شده</option>
                      <option value="تحویل مشتری">تحویل مشتری</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px]">{ord.trackingCode}</span>
                      <button
                        onClick={() => handleCopyTracking(ord.trackingCode)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                        title="کپی بارکد پستی"
                      >
                        {copiedTrackingId === ord.trackingCode ? (
                          <Check className="w-3.5 h-3.5 text-[#8A532B]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedOrderForSlip(ord)}
                      className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>قبض ارسال</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipping Slip Modal with clean subtle 1px border */}
      {selectedOrderForSlip && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-start shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#8A532B]" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  قبض رسمی پست پیشتاز حیات
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForSlip(null)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slip Container with clean 1px border */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
              <div className="flex justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-2">
                <span className="font-mono text-zinc-400">شناسه مرسوله: {selectedOrderForSlip.id}</span>
                <span className="font-num text-zinc-500">{selectedOrderForSlip.date}</span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400 block text-[11px]">گیرنده محترم:</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{selectedOrderForSlip.customer}</p>
                <p className="font-mono text-zinc-600 dark:text-zinc-400">{selectedOrderForSlip.phone}</p>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400 block text-[11px]">نشانی پستی:</span>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {selectedOrderForSlip.address || 'تهران، خیابان انقلاب، خیابان قدس، کوچه آذین، پلاک ۴'}
                </p>
                <p className="font-mono text-zinc-500">کد پستی ۱۰ رقمی: {selectedOrderForSlip.postalCode || '1417834591'}</p>
              </div>

              <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 flex justify-between items-center">
                <span>محتوای بسته: <strong className="text-zinc-800 dark:text-zinc-200">{selectedOrderForSlip.item}</strong></span>
                <span className="font-mono text-[11px] text-[#8A532B] font-bold">{selectedOrderForSlip.total}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>چاپ قبض ارسال</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
