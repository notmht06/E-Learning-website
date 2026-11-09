'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  Trash2,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/services/apiClient';
import { CourseReview } from '@/types';

export function AdminReviewsTab() {
  const { dict, toLocale } = useLanguage();

  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const data = await apiClient.admin.getReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed fetching admin reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm(dict.course_reviews_delete_confirm)) return;

    setActionLoadingId(reviewId);
    try {
      await apiClient.admin.deleteReview(reviewId);
      await fetchReviews();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'خطا در حذف دیدگاه');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleBan = async (userId: string, isBanned: boolean) => {
    if (!window.confirm(dict.course_reviews_ban_confirm)) return;

    setActionLoadingId(userId);
    try {
      await apiClient.admin.banUserComments(userId, !isBanned);
      await fetchReviews();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'خطا در تغییر وضعیت دسترسی کاربر');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = reviews.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      r.user_name.toLowerCase().includes(q) ||
      (r.user_phone && r.user_phone.includes(q)) ||
      (r.course_title && r.course_title.toLowerCase().includes(q)) ||
      r.comment.toLowerCase().includes(q)
    );
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';
  const bannedCount = reviews.filter((r) => r.is_user_banned).length;

  return (
    <div className="space-y-6 text-start">
      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
              تعداد کل دیدگاه‌ها
            </span>
            <span className="text-xl font-bold font-num text-zinc-900 dark:text-zinc-100">
              {toLocale(totalReviews)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
              میانگین ارزیابی دوره‌ها
            </span>
            <span className="text-xl font-bold font-num text-amber-600 dark:text-amber-400">
              {toLocale(avgRating)} / ۵
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Star className="w-5 h-5 fill-current" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
              کاربران مسدودشده از ثبت نظر
            </span>
            <span className="text-xl font-bold font-num text-red-600 dark:text-red-400">
              {toLocale(bannedCount)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو در نام دانشجو، شماره تماس، عنوان دوره یا متن دیدگاه..."
          className="flex-1 bg-transparent text-xs sm:text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
          >
            پاکسازی
          </button>
        )}
      </div>

      {/* Table / List */}
      <div className="rounded-2xl bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#8A532B]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-xs sm:text-sm">
            دیدگاهی یافت نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold">
                <tr>
                  <th className="px-4 py-3 text-start">دوره</th>
                  <th className="px-4 py-3 text-start">دانشجو</th>
                  <th className="px-4 py-3 text-center">امتیاز</th>
                  <th className="px-4 py-3 text-start">دیدگاه</th>
                  <th className="px-4 py-3 text-center">وضعیت کاربر</th>
                  <th className="px-4 py-3 text-end">عملیات مدیریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filtered.map((rev) => (
                  <tr key={rev.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-3.5 max-w-[180px]">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {rev.course_title || rev.course_id}
                      </span>
                      {rev.created_at && (
                        <span className="text-[11px] text-zinc-400 block font-num">
                          {toLocale(new Date(rev.created_at).toLocaleDateString('fa-IR'))}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                        {rev.user_name}
                      </span>
                      {rev.user_phone && (
                        <span className="text-[11px] text-zinc-400 font-num block">
                          {toLocale(rev.user_phone)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold font-num">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{toLocale(rev.rating)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs text-zinc-700 dark:text-zinc-300">
                      <p className="line-clamp-2 leading-relaxed">
                        {rev.comment}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {rev.is_user_banned ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-500/20">
                          مسدود از ثبت نظر
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                          فعال
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-end whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          disabled={actionLoadingId === rev.user_id}
                          onClick={() => handleToggleBan(rev.user_id, Boolean(rev.is_user_banned))}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                            rev.is_user_banned
                              ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                              : 'border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                          }`}
                        >
                          <ShieldAlert className="w-3 h-3" />
                          <span>
                            {rev.is_user_banned ? dict.course_reviews_admin_unban : dict.course_reviews_admin_ban}
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === rev.id}
                          onClick={() => handleDelete(rev.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{dict.course_reviews_admin_delete}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
