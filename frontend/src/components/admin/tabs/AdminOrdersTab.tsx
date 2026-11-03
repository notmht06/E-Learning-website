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
    const token = typeof window !== 'undefined' ? localStorage.getItem('zanjirzan_token') : null;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

    fetch(`${apiBase}/admin/students-overview`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!mounted || !data) return;
        if (Array.isArray(data.students)) setServerStudents(data.students);
        if (Array.isArray(data.orders)) setServerOrders(data.orders);
      })
      .catch(() => {})
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
    <div className="space-y-6 animate-tab-fade text-start" dir="rtl">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-700 dark:text-amber-500" />
            بانک اطلاعاتی دانش‌پژوهان و سوابق ثبت‌نام دوره‌ها
          </h2>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
            مشاهده پروفایل هر دانشجو، تعداد دوره‌های ثبت‌نام‌شده، درصد پیشرفت جلسات و فاکتورهای ثبت‌نام
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('students')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'students'
                ? 'bg-[#4A2C18] text-white shadow-sm'
                : 'text-stone-600 dark:text-zinc-300 hover:bg-stone-200/60'
            }`}
          >
            پروفایل دانش‌پژوهان ({toLocale(serverStudents.length)})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-[#4A2C18] text-white shadow-sm'
                : 'text-stone-600 dark:text-zinc-300 hover:bg-stone-200/60'
            }`}
          >
            آخرین فاکتورها و ثبت‌نام‌ها ({toLocale(mergedOrders.length)})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو بر اساس نام دانش‌پژوه، شماره موبایل، عنوان دوره یا شماره فاکتور..."
          className="w-full pr-11 pl-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/30"
        />
      </div>

      {/* SubTab 1: Students Directory & Analytics CRM */}
      {activeSubTab === 'students' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/80 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-stone-50 dark:bg-zinc-800/60 text-stone-600 dark:text-zinc-400 text-xs border-b border-stone-200/80 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">نام دانش‌پژوه</th>
                  <th className="py-3.5 px-4 font-bold">شماره تماس</th>
                  <th className="py-3.5 px-4 font-bold">تعداد دوره‌های ثبت‌نامی</th>
                  <th className="py-3.5 px-4 font-bold">آخرین دوره‌های فعال</th>
                  <th className="py-3.5 px-4 font-bold">مجموع تراکنش‌ها</th>
                  <th className="py-3.5 px-4 font-bold text-center">پروفایل و آمار کامل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-stone-400 text-xs">
                      {isLoading ? 'در حال بارگذاری اطلاعات دانش‌پژوهان...' : 'هیچ دانش‌پژوهی با این مشخصات یافت نشد.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu) => (
                    <tr
                      key={stu.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                        {stu.full_name}
                        {stu.role === 'admin' && (
                          <span className="mr-2 px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800">
                            مدیر
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-num text-stone-600 dark:text-zinc-300" dir="ltr">
                        {stu.phone}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <BookOpen className="w-3.5 h-3.5" />
                          {toLocale(stu.enrolled_courses_count || 0)} دوره
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-stone-600 dark:text-zinc-400 max-w-xs truncate">
                        {(stu.enrolled_courses || []).length > 0
                          ? stu.enrolled_courses.map((c: any) => c.course_title).join('، ')
                          : 'بدون دوره فعال'}
                      </td>
                      <td className="py-3.5 px-4 font-num text-xs font-semibold text-stone-700 dark:text-zinc-300">
                        {stu.total_spent > 0
                          ? `${stu.total_spent.toLocaleString('fa-IR')} تومان`
                          : 'رایگان (وقف علمی)'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(stu)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          مشاهده پنل دانشجو
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

      {/* SubTab 2: Course Orders & Invoices (No Postal Slips) */}
      {activeSubTab === 'orders' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/80 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-stone-50 dark:bg-zinc-800/60 text-stone-600 dark:text-zinc-400 text-xs border-b border-stone-200/80 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">شماره فاکتور</th>
                  <th className="py-3.5 px-4 font-bold">نام دانش‌پژوه</th>
                  <th className="py-3.5 px-4 font-bold">شماره موبایل</th>
                  <th className="py-3.5 px-4 font-bold">دوره ثبت‌نام‌شده</th>
                  <th className="py-3.5 px-4 font-bold">مبلغ</th>
                  <th className="py-3.5 px-4 font-bold">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-stone-400 text-xs">
                      هنوز فاکتور یا ثبت‌نام جدیدی ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-stone-50/80 dark:hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4 font-mono text-xs text-stone-600 dark:text-zinc-400">
                        {ord.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                        {ord.customer}
                      </td>
                      <td className="py-3.5 px-4 font-num text-xs text-stone-600" dir="ltr">
                        {ord.phone}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-stone-700 dark:text-zinc-300">
                        {ord.item}
                      </td>
                      <td className="py-3.5 px-4 font-num text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {ord.total}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          {ord.status}
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
          className="fixed inset-0 !mt-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-stone-200 dark:border-zinc-800 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-stone-200 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  پرونده آموزشی و آمار دانش‌پژوه
                </span>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mt-1">
                  {selectedStudent.full_name}
                </h3>
                <div className="flex items-center gap-4 text-xs text-stone-500 mt-1.5">
                  <span className="flex items-center gap-1 font-num" dir="ltr">
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
                className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700">
                <span className="text-[11px] text-stone-500 block">دوره‌های ثبت‌نامی</span>
                <span className="text-lg font-extrabold text-stone-900 dark:text-white font-num mt-1 block">
                  {toLocale(selectedStudent.enrolled_courses_count || 0)} دوره
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700">
                <span className="text-[11px] text-stone-500 block">تعداد فاکتورها</span>
                <span className="text-lg font-extrabold text-stone-900 dark:text-white font-num mt-1 block">
                  {toLocale(selectedStudent.orders_count || 0)} سفارش
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/60 dark:border-zinc-700">
                <span className="text-[11px] text-stone-500 block">مجموع پرداختی</span>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 font-num mt-1.5 block">
                  {selectedStudent.total_spent > 0
                    ? `${selectedStudent.total_spent.toLocaleString('fa-IR')} تومان`
                    : 'رایگان'}
                </span>
              </div>
            </div>

            {/* Enrolled Courses List */}
            <div>
              <h4 className="text-sm font-bold text-stone-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                دوره‌های ثبت‌نام‌شده و میزان پیشرفت
              </h4>
              {(selectedStudent.enrolled_courses || []).length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center bg-stone-50 dark:bg-zinc-800/40 rounded-xl">
                  این دانش‌پژوه هنوز در هیچ دوره‌ای ثبت‌نام نکرده است.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {selectedStudent.enrolled_courses.map((ec: any) => (
                    <div
                      key={ec.course_id}
                      className="p-3.5 rounded-xl border border-stone-200 dark:border-zinc-800 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-xs font-bold text-stone-900 dark:text-white">
                          {ec.course_title}
                        </p>
                        {ec.enrolled_at && (
                          <span className="text-[11px] text-stone-400 block mt-0.5">
                            ثبت‌نام: {new Date(ec.enrolled_at).toLocaleDateString('fa-IR')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <div className="w-20 h-2 bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${Math.max(5, ec.progress_percent || 0)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold font-num text-stone-700 dark:text-zinc-300">
                          {toLocale(ec.progress_percent || 0)}%
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
