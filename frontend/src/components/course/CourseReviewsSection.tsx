'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, ShieldAlert, Trash2, CheckCircle2, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/services/apiClient';
import { CourseReviewsSummary, CourseReview } from '@/types';
import Link from 'next/link';

interface CourseReviewsSectionProps {
  courseId: string;
}

export function CourseReviewsSection({ courseId }: CourseReviewsSectionProps) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { dict, toLocale, localizeHref } = useLanguage();

  const [summary, setSummary] = useState<CourseReviewsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const data = await apiClient.courses.getReviews(courseId);
      setSummary(data);
      if (data.user_review) {
        setRating(data.user_review.rating);
        setCommentText(data.user_review.comment);
      }
    } catch (err) {
      console.error('Failed fetching reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await apiClient.courses.submitReview(courseId, { rating, comment: commentText.trim() });
      setStatusMessage({ type: 'success', text: dict.course_reviews_success_toast });
      await fetchReviews();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'خطا در ثبت دیدگاه';
      setStatusMessage({ type: 'error', text: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
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

  const handleToggleBanUser = async (userId: string, currentBanned: boolean) => {
    if (!window.confirm(dict.course_reviews_ban_confirm)) return;

    setActionLoadingId(userId);
    try {
      await apiClient.admin.banUserComments(userId, !currentBanned);
      await fetchReviews();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'خطا در تغییر وضعیت دسترسی کاربر');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 1:
        return dict.course_reviews_rate_1;
      case 2:
        return dict.course_reviews_rate_2;
      case 3:
        return dict.course_reviews_rate_3;
      case 4:
        return dict.course_reviews_rate_4;
      case 5:
      default:
        return dict.course_reviews_rate_5;
    }
  };

  const activeStar = hoverRating || rating;

  return (
    <section id="course-reviews" className="space-y-8 scroll-mt-24">
      {/* Header with Title and Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1D8] dark:border-[#24262D] pb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <Star className="w-5 h-5 fill-[#C58B43] text-[#C58B43]" />
            <span>{dict.course_reviews_title}</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {dict.course_reviews_subtitle}
          </p>
        </div>

        {summary && summary.total_reviews > 0 && (
          <div className="flex items-center gap-3 self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-2xl font-bold font-num text-[#8A532B] dark:text-[#C58B43]">
              {toLocale(summary.average_rating)}
            </span>
            <div className="text-[11px] leading-tight">
              <span className="block font-bold text-zinc-900 dark:text-zinc-100 font-num">
                {toLocale(summary.total_reviews)} {dict.course_reviews_count_label}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {dict.course_reviews_average_label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Review Submission Area */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] shadow-xs space-y-4">
        {!isAuthenticated ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#1A1C21] border border-[#E6E1D8] dark:border-[#2B2E36]">
            <div className="flex items-center gap-3 text-xs text-zinc-700 dark:text-zinc-300">
              <AlertCircle className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
              <span>{dict.course_reviews_login_to_review}</span>
            </div>
            <Link
              href={localizeHref(`/login?redirect=/courses/${courseId}`)}
              className="px-4 py-2 rounded-lg bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold transition text-center shrink-0 cursor-pointer"
            >
              {dict.nav_login}
            </Link>
          </div>
        ) : summary?.is_comment_banned ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{dict.course_reviews_banned_notice}</span>
          </div>
        ) : !summary?.is_enrolled && !isAdmin ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{dict.course_reviews_only_enrolled_notice}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
                <span>{dict.course_reviews_submit_title}</span>
              </h3>

              {/* Interactive 5-Star Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {dict.course_reviews_rate_label}
                </span>
                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="p-1 rounded-md hover:scale-110 transition cursor-pointer"
                      title={getRatingLabel(star)}
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          star <= activeStar
                            ? 'fill-[#C58B43] text-[#C58B43]'
                            : 'text-zinc-300 dark:text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43] min-w-[70px]">
                  {getRatingLabel(activeStar)}
                </span>
              </div>
            </div>

            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={dict.course_reviews_comment_placeholder}
              required
              className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] text-xs sm:text-sm outline-none focus:border-[#8A532B] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition"
            />

            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>
                    {summary?.user_review ? dict.course_reviews_update_btn : dict.course_reviews_submit_btn}
                  </span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#8A532B]" />
          </div>
        ) : !summary || summary.reviews.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] space-y-2">
            <Star className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {dict.course_reviews_no_reviews}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {summary.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#24262D] shadow-xs space-y-3"
              >
                {/* Author & Rating Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {rev.user_avatar ? (
                      <img
                        src={rev.user_avatar}
                        alt={rev.user_name}
                        className="w-9 h-9 rounded-full object-cover border border-[#8A532B]/30"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#8A532B]/10 dark:bg-[#C58B43]/15 border border-[#8A532B]/20 dark:border-[#C58B43]/30 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center font-bold text-xs">
                        {rev.user_name.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {rev.user_name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium flex items-center gap-1 border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{dict.course_reviews_verified_student}</span>
                        </span>
                        {rev.is_user_banned && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-500/20">
                            مسدود از نظردهی
                          </span>
                        )}
                      </div>
                      {rev.created_at && (
                        <span className="text-[11px] text-zinc-400 font-num">
                          {toLocale(new Date(rev.created_at).toLocaleDateString('fa-IR'))}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating Stars Badge */}
                  <div className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-xs font-bold font-num text-[#8A532B] dark:text-[#C58B43]">
                      {toLocale(rev.rating)}
                    </span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= rev.rating
                              ? 'fill-[#C58B43] text-[#C58B43]'
                              : 'text-zinc-300 dark:text-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed text-justify">
                  {rev.comment}
                </p>

                {/* Admin Moderation Bar */}
                {isAdmin && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-2 text-xs">
                    <button
                      type="button"
                      disabled={actionLoadingId === rev.user_id}
                      onClick={() => handleToggleBanUser(rev.user_id, Boolean(rev.is_user_banned))}
                      className="px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>
                        {rev.is_user_banned ? dict.course_reviews_admin_unban : dict.course_reviews_admin_ban}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === rev.id}
                      onClick={() => handleDeleteReview(rev.id)}
                      className="px-3 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{dict.course_reviews_admin_delete}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
