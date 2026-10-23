'use client';

import React from 'react';
import {
  Package,
  Truck,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';

export function DashboardOrdersTab() {
  const { orders } = useData();
  const { toLocale } = useLanguage();

  return (
    <div className="space-y-6 text-start">
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            سفارش‌های پستی کتب و بسته‌های فیزیکی
          </h2>
          <p className="text-xs text-zinc-500">
            رهگیری لحظه‌ای مرسولات پستی با کد رهگیری ۲۴ رقمی شرکت ملی پست
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50 dark:bg-zinc-900/50">
                <th className="py-3 px-4 font-normal text-start">شناسه فاکتور</th>
                <th className="py-3 px-4 font-normal text-start">عنوان اثر</th>
                <th className="py-3 px-4 font-normal text-start">مبلغ پرداختی</th>
                <th className="py-3 px-4 font-normal text-start">وضعیت ارسال</th>
                <th className="py-3 px-4 font-normal text-start">کد رهگیری پست پیشتاز</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                  <td className="py-3 px-4 font-mono text-zinc-500">{ord.id}</td>
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">{ord.item}</td>
                  <td className="py-3 px-4 font-bold text-[#8A532B]">{ord.total}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-[#8A532B]/10 text-[#8A532B] font-medium">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span>{ord.trackingCode}</span>
                      <a
                        href={`https://tracking.post.ir/?id=${ord.trackingCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#8A532B] hover:underline flex items-center gap-0.5 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>رهگیری</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
