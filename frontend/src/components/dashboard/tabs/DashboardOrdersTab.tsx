'use client';

import React from 'react';
import {
  ExternalLink,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { toLocaleDigits } from '@/lib/data';

export function DashboardOrdersTab() {
  const { orders } = useData();
  const { currentLang } = useLanguage();

  const title = currentLang === 'en'
    ? 'Postal Orders & Physical Books'
    : currentLang === 'ar'
    ? 'طلبات الكتب البريدية والطرود'
    : 'سفارش‌های پستی کتب و بسته‌های فیزیکی';

  const subtitle = currentLang === 'en'
    ? 'Real-time postal tracking via national 24-digit dispatch code'
    : currentLang === 'ar'
    ? 'تتبع فوري للشحنات البريدية عبر رمز التتبع الوطني'
    : 'رهگیری لحظه‌ای مرسولات پستی با کد رهگیری ۲۴ رقمی شرکت ملی پست';

  const colInvoice = currentLang === 'en' ? 'Invoice ID' : currentLang === 'ar' ? 'رقم الفاتورة' : 'شناسه فاکتور';
  const colItem = currentLang === 'en' ? 'Item Title' : currentLang === 'ar' ? 'عنوان الأثر' : 'عنوان اثر';
  const colAmount = currentLang === 'en' ? 'Amount Paid' : currentLang === 'ar' ? 'المبلغ المدفوع' : 'مبلغ پرداختی';
  const colStatus = currentLang === 'en' ? 'Delivery Status' : currentLang === 'ar' ? 'حالة الشحن' : 'وضعیت ارسال';
  const colTracking = currentLang === 'en' ? 'Express Tracking Code' : currentLang === 'ar' ? 'رمز تتبع البريد' : 'کد رهگیری پست پیشتاز';
  const trackBtn = currentLang === 'en' ? 'Track' : currentLang === 'ar' ? 'تتبع' : 'رهگیری';

  const formatStatus = (status: string) => {
    if (currentLang === 'en') {
      if (status.includes('ارسال') || status.includes('پست')) return 'Dispatched to Postal Service';
      if (status.includes('پردازش')) return 'Processing Order';
      if (status.includes('تحویل')) return 'Delivered';
      return status;
    }
    if (currentLang === 'ar') {
      if (status.includes('ارسال') || status.includes('پست')) return 'تم التسليم للبريد السريع';
      if (status.includes('پردازش')) return 'قيد التجهيز';
      if (status.includes('تحویل')) return 'تم التسليم';
      return status;
    }
    return status;
  };

  const formatTotal = (total: string) => {
    if (currentLang === 'en') {
      return toLocaleDigits(total, 'en')
        .replace(/تومان/g, 'TOMAN')
        .replace(/ریال/g, 'IRR')
        .replace(/رایگان/g, 'Free');
    }
    if (currentLang === 'ar') {
      return toLocaleDigits(total, 'ar')
        .replace(/تومان/g, 'تومان')
        .replace(/رایگان/g, 'مجاني');
    }
    return toLocaleDigits(total, 'fa');
  };

  return (
    <div className="space-y-6 text-start">
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <p className="text-xs text-zinc-500">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50 dark:bg-zinc-900/50">
                <th className="py-3 px-4 font-normal text-start">{colInvoice}</th>
                <th className="py-3 px-4 font-normal text-start">{colItem}</th>
                <th className="py-3 px-4 font-normal text-start">{colAmount}</th>
                <th className="py-3 px-4 font-normal text-start">{colStatus}</th>
                <th className="py-3 px-4 font-normal text-start">{colTracking}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                  <td className="py-3 px-4 font-mono text-zinc-500">{toLocaleDigits(ord.id, currentLang)}</td>
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">{ord.item}</td>
                  <td className="py-3 px-4 font-bold text-[#8A532B]">{formatTotal(ord.total)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-[#8A532B]/10 text-[#8A532B] font-medium">
                      {formatStatus(ord.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span>{toLocaleDigits(ord.trackingCode, currentLang)}</span>
                      <a
                        href={`https://tracking.post.ir/?id=${ord.trackingCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#8A532B] hover:underline flex items-center gap-0.5 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{trackBtn}</span>
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
