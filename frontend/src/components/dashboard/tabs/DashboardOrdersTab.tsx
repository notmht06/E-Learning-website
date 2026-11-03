'use client';

import React from 'react';
import {
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { toLocaleDigits } from '@/lib/data';

export function DashboardOrdersTab() {
  const { orders } = useData();
  const { currentLang } = useLanguage();

  const title = currentLang === 'en'
    ? 'Course Enrollment Invoices'
    : currentLang === 'ar'
    ? 'سجلات وفواتير التسجيل في الدورات'
    : 'فاکتورها و سوابق ثبت‌نام دوره‌ها';

  const subtitle = currentLang === 'en'
    ? 'Official tuition payment receipts and course registrations history'
    : currentLang === 'ar'
    ? 'إيصالات السداد الرسمية وسجل الدورات المسجلة في الحساب'
    : 'رسید پرداخت‌های رسمی و تاریخچه دوره‌های ثبت‌نام‌شده';

  const colInvoice = currentLang === 'en' ? 'Invoice ID' : currentLang === 'ar' ? 'رقم الفاتورة' : 'شماره فاکتور';
  const colItem = currentLang === 'en' ? 'Course Title' : currentLang === 'ar' ? 'عنوان الدورة' : 'عنوان دوره آموزشی';
  const colAmount = currentLang === 'en' ? 'Amount Paid' : currentLang === 'ar' ? 'المبلغ المسدد' : 'مبلغ پرداختی';
  const colStatus = currentLang === 'en' ? 'Status' : currentLang === 'ar' ? 'حالة التسجيل' : 'وضعیت ثبت‌نام';
  const colDate = currentLang === 'en' ? 'Date' : currentLang === 'ar' ? 'التاريخ' : 'تاریخ ثبت';

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

  const courseOrders = orders.filter((o) => (o as any).itemType !== 'book');

  return (
    <div className="space-y-6 text-start">
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
            <span>{title}</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
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
                <th className="py-3 px-4 font-normal text-start">{colDate}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {courseOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400">
                    {currentLang === 'en'
                      ? 'No enrollment invoices found yet.'
                      : currentLang === 'ar'
                      ? 'لا توجد فواتير تسجيل حتى الآن.'
                      : 'هنوز فاکتور ثبت‌نامی در سامانه ثبت نشده است.'}
                  </td>
                </tr>
              ) : (
                courseOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                    <td className="py-3 px-4 font-mono text-zinc-500">{toLocaleDigits(ord.id, currentLang)}</td>
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">{ord.item}</td>
                    <td className="py-3 px-4 font-bold text-[#8A532B] dark:text-[#C58B43]">{formatTotal(ord.total)}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {currentLang === 'en'
                            ? 'Enrollment Completed'
                            : currentLang === 'ar'
                            ? 'تم التسجيل بنجاح'
                            : 'ثبت‌نام تکمیل شده'}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500">{toLocaleDigits(ord.date || '۱۴۰۳', currentLang)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
