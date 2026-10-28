'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Tag,
  ShieldCheck,
  Check,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Sparkles,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useCart, CartItem } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { parseNumericPrice } from '@/lib/utils';
import { triggerTactileHaptic } from '@/lib/haptics';
import { apiClient } from '@/services/apiClient';

export default function DedicatedCartPage() {
  const router = useRouter();
  const { items, removeItem, clearCart } = useCart();
  const { dict, currentLang, toLocale } = useLanguage();
  const { coupons } = useData();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    percent: number;
    discountAmount: number;
  } | null>(null);
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [couponMessage, setCouponMessage] = useState('');

  // Hydrate previously applied coupon if any
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('zan_applied_coupon');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.code && parsed.percent) {
            setAppliedCoupon(parsed);
          }
        }
      } catch (err) {
        console.debug('Failed to read saved coupon:', err);
      }
    }
  }, []);

  // Compute subtotal
  const rawTotal = items.reduce((sum, item) => sum + parseNumericPrice(item.price), 0);

  // Recalculate discount whenever rawTotal or appliedCoupon changes
  const discountAmount = appliedCoupon
    ? Math.round(rawTotal * (appliedCoupon.percent / 100))
    : 0;

  const finalPayable = Math.max(0, rawTotal - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    triggerTactileHaptic('tick');
    setCouponStatus('loading');
    setCouponMessage('');

    try {
      // 1. Try backend coupon validation endpoint if accessible
      const res = await apiClient.coupons.validate(cleanCode, rawTotal);
      if (res && res.valid) {
        const percent = res.discount_percent || (res.discount_amount ? Math.round((res.discount_amount / rawTotal) * 100) : 20);
        const discountVal = res.discount_amount || Math.round(rawTotal * (percent / 100));
        const couponObj = { code: cleanCode, percent, discountAmount: discountVal };
        setAppliedCoupon(couponObj);
        setCouponStatus('success');
        setCouponMessage(dict.cart_coupon_success || 'کد تخفیف با موفقیت اعمال گردید');
        if (typeof window !== 'undefined') {
          localStorage.setItem('zan_applied_coupon', JSON.stringify(couponObj));
        }
        return;
      }
    } catch (err) {
      console.debug('Backend coupon validate fallback to local database:', err);
    }

    // 2. Fallback to client-side coupons catalog
    const localMatch = coupons?.find(
      (c) => c.code.toUpperCase() === cleanCode && (c.isActive ?? true)
    );

    if (localMatch) {
      const percent = localMatch.discountPercent || 20;
      const discountVal = Math.round(rawTotal * (percent / 100));
      const couponObj = { code: cleanCode, percent, discountAmount: discountVal };
      setAppliedCoupon(couponObj);
      setCouponStatus('success');
      setCouponMessage(dict.cart_coupon_success || 'کد تخفیف با موفقیت اعمال گردید');
      if (typeof window !== 'undefined') {
        localStorage.setItem('zan_applied_coupon', JSON.stringify(couponObj));
      }
    } else {
      setCouponStatus('error');
      setCouponMessage(dict.cart_coupon_invalid || 'کد تخفیف واردشده معتبر نیست یا منقضی شده است');
    }
  };

  const handleRemoveCoupon = () => {
    triggerTactileHaptic('tick');
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponStatus('idle');
    setCouponMessage('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zan_applied_coupon');
    }
  };

  const handleProceedToCheckout = () => {
    triggerTactileHaptic('thump');
    if (appliedCoupon && typeof window !== 'undefined') {
      localStorage.setItem('zan_applied_coupon', JSON.stringify(appliedCoupon));
    }
    router.push('/checkout');
  };

  const handleRemoveItem = (id: string) => {
    triggerTactileHaptic('thump');
    removeItem(id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#0C0D0E] dark:text-[#FAF8F5] transition-colors pb-16">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full text-start">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1D8] dark:border-[#22242A] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200">
                {dict.cart_breadcrumb_home || 'صفحه نخست'}
              </Link>
              <span>/</span>
              <span className="text-[#8A532B] dark:text-[#C58B43]">
                {dict.cart_breadcrumb_cart || 'سبد سفارشات'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5] flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#8A532B] dark:text-[#C58B43]" />
              <span>{dict.cart_title || 'سبد سفارشات و ثبت‌نام'}</span>
            </h1>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 font-num">
                {toLocale(items.length)} {dict.cart_items_count_badge || 'مورد در سبد سفارشات شما'}
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerTactileHaptic('thump');
                  clearCart();
                }}
                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-950/60 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{dict.cart_clear_all || 'پاک کردن کل سبد'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] text-center max-w-xl mx-auto space-y-5 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] flex items-center justify-center text-zinc-400 mx-auto">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
                {dict.cart_empty_title || 'سبد سفارشات شما خالی است'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                {dict.cart_empty_desc ||
                  'هیچ دوره یا کتابی هنوز به سبد خرید افزوده نشده است. برای مشاهده درس‌گفتارها و آثار چاپی، به کاتالوگ مراجعه فرمایید.'}
              </p>
            </div>

            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>{dict.cart_browse_courses_btn || 'مشاهده دوره‌ها و کتب تخصصی'}</span>
            </Link>
          </div>
        ) : (
          /* 2-Column Cart Layout: Items List (8 cols) + Sticky Summary Invoice (4 cols) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Column 1: Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item, idx) => {
                const numericPrice = parseNumericPrice(item.price);
                const isBook = item.type === 'book' || item.itemType?.includes('book');

                return (
                  <article
                    key={`${item.id}-${idx}`}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs hover:border-[#8A532B]/40 transition group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail / Media icon */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] flex items-center justify-center text-[#8A532B] dark:text-[#C58B43] shrink-0 overflow-hidden relative">
                        {item.coverImage ? (
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : isBook ? (
                          <BookOpen className="w-7 h-7 stroke-[1.75]" />
                        ) : (
                          <GraduationCap className="w-8 h-8 stroke-[1.75]" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] text-[10px] font-mono font-bold text-[#8A532B] dark:text-[#C58B43]">
                            {isBook
                              ? currentLang === 'en'
                                ? 'Printed Treatise'
                                : currentLang === 'ar'
                                ? 'أثر مطبوع'
                                : 'اثر چاپی'
                              : currentLang === 'en'
                              ? 'Curriculum Course'
                              : currentLang === 'ar'
                              ? 'درس‌گفتار حوزوی'
                              : 'درس‌گفتار تخصصی'}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-[#0C0D0E] dark:text-[#FAF8F5] leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-xs text-zinc-500">
                          {currentLang === 'en' ? 'Instructor:' : currentLang === 'ar' ? 'المدرس:' : 'مدرس:'}{' '}
                          {dict.scholar_name || 'حجت الاسلام دکتر زنجیر زن حسینی'}
                        </p>
                      </div>
                    </div>

                    {/* Price and Delete Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E6E1D8] dark:border-[#22242A]">
                      <div className="text-start sm:text-end">
                        <span className="text-[10px] text-zinc-400 block sm:hidden">
                          {dict.course_tuition_label || 'شهریه'}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#8A532B] dark:text-[#C58B43] font-num">
                          {numericPrice === 0
                            ? dict.course_free_badge || 'رایگان'
                            : `${toLocale(numericPrice.toLocaleString('fa-IR'))} ${dict.course_currency_toman || 'تومان'}`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                        title={dict.cart_remove_btn || 'حذف از سبد'}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Column 2: Sticky Order Summary & Invoice (4 cols) */}
            <aside className="lg:col-span-4 space-y-5 sticky top-6">
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] space-y-5 shadow-xs">
                {/* Header */}
                <header className="border-b border-[#E6E1D8] dark:border-[#22242A] pb-3">
                  <h2 className="text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
                    {dict.cart_invoice_title || 'خلاصه پیش‌فاکتور سفارش'}
                  </h2>
                </header>

                {/* Calculation Rows */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                    <span>{dict.cart_subtotal_label || 'مجموع شهریه اقلام:'}</span>
                    <span className="font-bold font-num text-zinc-900 dark:text-zinc-100">
                      {toLocale(rawTotal.toLocaleString('fa-IR'))} {dict.course_currency_toman || 'تومان'}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>
                          {dict.cart_discount_label || 'تخفیف کوپن:'} ({toLocale(appliedCoupon.percent)}%)
                        </span>
                      </span>
                      <span className="font-bold font-num">
                        -{toLocale(discountAmount.toLocaleString('fa-IR'))} {dict.course_currency_toman || 'تومان'}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-zinc-500">
                    <span>{dict.cart_endowment_subsidy || 'بورسیه و وقف آموزشی:'}</span>
                    <span className="font-mono font-num text-emerald-600 dark:text-emerald-400">
                      {toLocale(0)} {dict.course_currency_toman || 'تومان'}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#E6E1D8] dark:border-[#22242A] flex justify-between items-center text-sm">
                    <span className="font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
                      {dict.cart_final_payable || 'مبلغ نهایی قابل پرداخت:'}
                    </span>
                    <span className="text-base font-bold text-[#8A532B] dark:text-[#C58B43] font-num">
                      {toLocale(finalPayable.toLocaleString('fa-IR'))} {dict.course_currency_toman || 'تومان'}
                    </span>
                  </div>
                </div>

                {/* Coupon Input Form */}
                <div className="pt-2 border-t border-[#E6E1D8] dark:border-[#22242A] space-y-2.5">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={dict.cart_coupon_placeholder || 'کد تخفیف (مثال: NOOR20)...'}
                      disabled={couponStatus === 'loading' || !!appliedCoupon}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-[#8A532B] transition placeholder:text-zinc-400 disabled:opacity-50"
                    />

                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-3 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 text-xs font-bold transition cursor-pointer"
                      >
                        {dict.cart_remove_btn || 'حذف'}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!couponCode.trim() || couponStatus === 'loading'}
                        className="px-4 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>{dict.cart_coupon_apply_btn || 'اعمال کد'}</span>
                      </button>
                    )}
                  </form>

                  {/* Feedback Message */}
                  {couponMessage && (
                    <div
                      className={`text-[11px] p-2 rounded-lg flex items-center gap-1.5 ${
                        couponStatus === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                      }`}
                    >
                      {couponStatus === 'success' ? (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{couponMessage}</span>
                    </div>
                  )}
                </div>

                {/* Primary Checkout CTA */}
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#E6CA85]" />
                  <span>{dict.cart_checkout_btn || 'تکمیل سفارش و پرداخت امن بانکی'}</span>
                </button>

                {/* Continue Shopping Link */}
                <div className="text-center pt-1">
                  <Link
                    href="/courses"
                    className="text-xs text-zinc-500 hover:text-[#8A532B] dark:hover:text-[#C58B43] transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{dict.cart_continue_shopping || 'ادامه انتخاب درس‌گفتارها'}</span>
                    <ArrowLeft className="w-3 h-3 rtl:rotate-0 ltr:rotate-180" />
                  </Link>
                </div>

                {/* Security Trust Badge */}
                <div className="pt-3 border-t border-[#E6E1D8] dark:border-[#22242A] flex items-center gap-2 text-[10px] text-zinc-400 leading-tight">
                  <ShieldCheck className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
                  <span>
                    {dict.cart_security_guarantee ||
                      'پرداخت امن تحت شبکه شاپرک با تضمین دسترسی آنی و بدون انقضا'}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
