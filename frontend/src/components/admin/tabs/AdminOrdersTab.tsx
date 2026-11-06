'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Users,
  BookOpen,
  CheckCircle2,
  Eye,
  X,
  Phone,
  Calendar,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/services/apiClient';

export function AdminOrdersTab() {
  const { orders } = useData();
  const { toLocale } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'students' | 'orders'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [serverStudents, setServerStudents] = useState<any[]>([]);
  const [serverOrders, setServerOrders] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    apiClient.admin
      .getStudentsOverview()
      .then((data: any) => {
        if (!mounted || !data) return;
        if (Array.isArray(data.students)) setServerStudents(data.students);
        if (Array.isArray(data.orders)) setServerOrders(data.orders);
      })
      .catch((err: any) => {
        console.warn('Failed to load students overview:', err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const mergedOrders = useMemo(() => {
    if (serverOrders.length > 0) {
      return serverOrders.map((o: any) => ({
        id: o.order_id || o.id,
        customer: o.customer_name || o.recipient_name || 'دانش‌پژوه حیات',
        phone: o.customer_phone || o.recipient_phone || '—',
        item:
          Array.isArray(o.items) && o.items.length > 0
            ? o.items.map((i: any) => i.title).join('، ')
            : 'ثبت‌نام دوره آموزشی',
        total: o.total_amount === 0 ? 'رایگان' : `${Number(o.total_amount || 0).toLocaleString('fa-IR')} تومان`,
        date: o.created_at ? new Date(o.created_at).toLocaleDateString('fa-IR') : '۱۴۰۳',
        status: o.status === 'paid' || o.status === 'completed' ? 'تکمیل شده' : 'ثبت شده',
      }));
    }
    return orders.filter((o) => (o as any).itemType !== 'book').map((o) => ({
      id: o.id,
      customer: o.customer,
      phone: o.phone,
      item: o.item,
      total: o.total,
      date: o.date,
      status: o.status,
    }));
  }, [serverOrders, orders]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return serverStudents;
    return serverStudents.filter(
      (s) =>
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.phone || '').includes(q) ||
        (s.enrolled_courses || []).some((c: any) => (c.course_title || '').toLowerCase().includes(q))
    );
  }, [serverStudents, searchQuery]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return mergedOrders;
    return mergedOrders.filter(
      (o) =>
        (o.customer || '').toLowerCase().includes(q) ||
        (o.phone || '').includes(q) ||
        (o.id || '').toLowerCase().includes(q) ||
        (o.item || '').toLowerCase().includes(q)
    );
  }, [mergedOrders, searchQuery]);

  return (
    <div className="space-y-6 text-start" dir="rtl">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#141518] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8A532B] dark:text-[#C58B43]" />
            <span>بانک اطلاعاتی دانش‌پژوهان و سوابق ثبت‌نام دوره‌ها</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            مشاهده پرونده هر دانش‌پژوه، تعداد دوره‌های ثبت‌نام‌شده، درصد پیشرفت جلسات و فاکتورها
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('students')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              activeSubTab === 'students'
                ? 'bg-[#8A532B] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            پروفایل دانش‌پژوهان ({toLocale(serverStudents.length)})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-[#8A532B] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            فاکتورها و ثبت‌نام‌ها ({toLocale(mergedOrders.length)})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute start-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو بر اساس نام دانش‌پژوه، شماره موبایل، عنوان دوره یا شماره فاکتور..."
          className="w-full ps-11 pe-4 py-3 rounded-xl bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] transition-colors"
        />
      </div>

      {/* SubTab 1: Students Directory & Analytics CRM */}
      {activeSubTab === 'students' && (
        <div className="bg-white dark:bg-[#141518] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 text-zinc-500 font-mono border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-normal text-start">نام دانش‌پژوه</th>
                  <th className="py-3.5 px-4 font-normal text-start">شماره تماس</th>
                  <th className="py-3.5 px-4 font-normal text-start">تعداد دوره‌های ثبت‌نامی</th>
                  <th className="py-3.5 px-4 font-normal text-start">آخرین دوره‌های فعال</th>
                  <th className="py-3.5 px-4 font-normal text-start">مجموع تراکنش‌ها</th>
                  <th className="py-3.5 px-4 font-normal text-center">پرونده و آمار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-400 text-xs">
                      {isLoading ? 'در حال بارگذاری اطلاعات دانش‌پژوهان...' : 'هیچ دانش‌پژوهی با این مشخصات یافت نشد.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu) => (
                    <tr
                      key={stu.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {stu.full_name}
                        {stu.role === 'admin' && (
                          <span className="ms-2 px-2 py-0.5 text-[10px] rounded-full bg-[#8A532B]/10 text-[#8A532B] font-bold">
                            مدیر
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400" dir="ltr">
                        {stu.phone}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/20 dark:text-[#C58B43]">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{toLocale(stu.enrolled_courses_count || 0)} دوره</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                        {(stu.enrolled_courses || []).length > 0
                          ? stu.enrolled_courses.map((c: any) => c.course_title).join('، ')
                          : 'بدون دوره فعال'}
                      </td>
                      <td className="py-3.5 px-4 font-num text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {stu.total_spent > 0
                          ? `${Number(stu.total_spent).toLocaleString('fa-IR')} تومان`
                          : 'رایگان (وقف علمی)'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(stu)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#8A532B]/10 hover:bg-[#8A532B]/20 text-[#8A532B] dark:text-[#C58B43] transition-all active:scale-95 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده پرونده</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Course Orders & Invoices */}
      {activeSubTab === 'orders' && (
        <div className="bg-white dark:bg-[#141518] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 text-zinc-500 font-mono border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-normal text-start">شماره فاکتور</th>
                  <th className="py-3.5 px-4 font-normal text-start">نام دانش‌پژوه</th>
                  <th className="py-3.5 px-4 font-normal text-start">شماره موبایل</th>
                  <th className="py-3.5 px-4 font-normal text-start">دوره ثبت‌نام‌شده</th>
                  <th className="py-3.5 px-4 font-normal text-start">مبلغ</th>
                  <th className="py-3.5 px-4 font-normal text-start">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-400 text-xs">
                      هنوز فاکتور یا ثبت‌نام جدیدی ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-3.5 px-4 font-mono text-zinc-500">
                        {ord.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {ord.customer}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400" dir="ltr">
                        {ord.phone}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300">
                        {ord.item}
                      </td>
                      <td className="py-3.5 px-4 font-num font-bold text-[#8A532B]">
                        {ord.total}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/20 dark:text-[#C58B43]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{ord.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Profile & Course Progress Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-white dark:bg-[#141518] rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43]">
                  پرونده آموزشی و آمار دانش‌پژوه
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {selectedStudent.full_name}
                </h3>
                <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1.5">
                  <span className="flex items-center gap-1 font-mono" dir="ltr">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedStudent.phone}
                  </span>
                  {selectedStudent.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      تاریخ عضویت: {new Date(selectedStudent.created_at).toLocaleDateString('fa-IR')}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block">دوره‌های ثبت‌نامی</span>
                <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-num mt-1 block">
                  {toLocale(selectedStudent.enrolled_courses_count || 0)} دوره
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block">تعداد سفارش‌ها</span>
                <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-num mt-1 block">
                  {toLocale(selectedStudent.orders_count || 0)} سفارش
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block">مجموع پرداختی</span>
                <span className="text-sm font-extrabold text-[#8A532B] dark:text-[#C58B43] font-num mt-1.5 block">
                  {selectedStudent.total_spent > 0
                    ? `${Number(selectedStudent.total_spent).toLocaleString('fa-IR')} تومان`
                    : 'رایگان (وقف علمی)'}
                </span>
              </div>
            </div>

            {/* Enrolled Courses List */}
            <div>
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#8A532B]" />
                <span>دوره‌های ثبت‌نام‌شده و میزان پیشرفت</span>
              </h4>
              {(selectedStudent.enrolled_courses || []).length === 0 ? (
                <p className="text-xs text-zinc-400 py-6 text-center bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  این دانش‌پژوه هنوز در هیچ دوره‌ای ثبت‌نام نکرده است.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {selectedStudent.enrolled_courses.map((ec: any) => (
                    <div
                      key={ec.course_id}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {ec.course_title}
                        </p>
                        {ec.enrolled_at && (
                          <span className="text-[11px] text-zinc-400 block mt-0.5">
                            تاریخ ثبت‌نام: {new Date(ec.enrolled_at).toLocaleDateString('fa-IR')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 min-w-[120px] shrink-0">
                        <div className="w-20 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#8A532B] dark:bg-[#C58B43] rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(5, ec.progress_percent || 0)}%` }}
                          />
                        </div>
                        <span className="font-num font-bold text-zinc-700 dark:text-zinc-300">
                          {toLocale(ec.progress_percent || 0)}٪
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
