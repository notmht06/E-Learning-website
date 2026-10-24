'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Truck,
  Tag,
  AlertCircle,
  ChevronLeft,
  X,
  RefreshCw,
  LogIn,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/services/apiClient';
import { parseNumericPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { coupons } = useData();
  const { currentLang, dict, toLocale } = useLanguage();
  const { items, removeItem } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Step 1: Coupon
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState<string>('');

  // Step 2: Shipping
  const [shippingData, setShippingData] = useState({
    fullName: '',
    phone: '',
    province: currentLang === 'en' ? 'Tehran' : currentLang === 'ar' ? 'طهران' : 'تهران',
    city: currentLang === 'en' ? 'Tehran' : currentLang === 'ar' ? 'طهران' : 'تهران',
    postalCode: '',
    address: '',
    deliveryNotes: '',
  });
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  // Step 3: Shaparak Payment Gateway
  const [selectedGateway, setSelectedGateway] = useState<'zarinpal' | 'mellat' | 'saman'>('zarinpal');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth gate: Guest users must authenticate before step 2 (shipping) or step 3 (payment)
  useEffect(() => {
    if (isMounted && step > 1 && !user && !isAuthenticated) {
      setStep(1);
      router.push('/login?redirect=/checkout');
    }
  }, [step, user, isAuthenticated, isMounted, router]);

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      setShippingData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || user.full_name || '',
        phone: prev.phone || user.phone || '',
      }));
    } else {
      setShippingData((prev) => ({
        ...prev,
        fullName: prev.fullName || '',
        phone: prev.phone || '',
      }));
    }
  }, [user, currentLang]);

  // Price calculations
  const calculateRawTotal = () => {
    return items.reduce((sum, item) => {
      const numeric = parseNumericPrice(item.price);
      return sum + numeric;
    }, 0);
  };

  const rawTotal = calculateRawTotal();
  const discountAmount = appliedCoupon ? Math.round(rawTotal * (appliedCoupon.percent / 100)) : 0;
  const shippingCost = 0; // Free express delivery
  const payableTotal = Math.max(0, rawTotal - discountAmount + shippingCost);

  // Format currency
  const formatPrice = (amount: number) => {
    if (currentLang === 'en') {
      return `$${Math.round(amount / 10000)}.00`;
    }
    return `${toLocale(amount.toLocaleString('fa-IR'))} ${currentLang === 'ar' ? 'تومان' : 'تومان'}`;
  };

  // Handlers
  const handleApplyCoupon = async () => {
    setCouponError('');
    const code = couponCode.trim();
    if (!code) return;

    try {
      const res = await apiClient.coupons.validate(code, rawTotal);
      if (res && res.valid) {
        setAppliedCoupon({ code: res.code || code.toUpperCase(), percent: res.discount_percent });
        setCouponCode('');
      } else {
        setCouponError(res?.message || dict.checkout_coupon_err || 'کد تخفیف نامعتبر یا منقضی شده است.');
      }
    } catch (err: any) {
      const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
      if (found) {
        setAppliedCoupon({ code: found.code, percent: found.discountPercent });
        setCouponCode('');
      } else {
        setCouponError(err?.message || dict.checkout_coupon_err || 'کد تخفیف نامعتبر یا منقضی شده است.');
      }
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const validateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shippingData.fullName.trim()) {
      errors.fullName = currentLang === 'en' ? 'Full name is required.' : currentLang === 'ar' ? 'الاسم الكامل مطلوب.' : 'نام و نام‌خانوادگی الزامی است.';
    }
    if (!/^09\d{9}$/.test(shippingData.phone.replace(/\s+/g, ''))) {
      errors.phone = currentLang === 'en' ? 'Valid mobile number required.' : currentLang === 'ar' ? 'رقم هاتف صالح مطلوب.' : 'شماره موبایل معتبر ۱۱ رقمی وارد فرمایید.';
    }
    if (!/^\d{10}$/.test(shippingData.postalCode.replace(/\s+/g, ''))) {
      errors.postalCode = currentLang === 'en' ? '10-digit postal code required.' : currentLang === 'ar' ? 'الرمز البريدي يجب أن يكون 10 أرقام.' : 'کد پستی باید ۱۰ رقم باشد.';
    }
    if (!shippingData.address.trim() || shippingData.address.length < 8) {
      errors.address = currentLang === 'en' ? 'Accurate address required.' : currentLang === 'ar' ? 'العنوان التفصيلي مطلوب.' : 'نشانی پستی دقیق الزامی است.';
    }

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGoToShipping = () => {
    if (items.length === 0) return;
    if (!user && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToPayment = () => {
    if (validateShipping()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInitiatePayment = async () => {
    if (isProcessingPayment || items.length === 0) return;
    setPaymentError('');

    if (!user && !isAuthenticated) {
      setPaymentError('برای اتصال به درگاه شاپرک و نهایی‌سازی سفارش، لطفاً ابتدا وارد حساب کاربری خود شوید.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const orderItems = items.map((item) => {
        const rawType = item.itemType || (item.type === 'book' ? 'book_print' : 'course');
        const resolvedType = rawType === 'book_physical' ? 'book_print' : rawType;
        return {
          item_id: item.id,
          item_type: resolvedType as 'course' | 'book_digital' | 'book_physical' | 'book_print',
          title: item.title,
          price: parseNumericPrice(item.price),
          quantity: 1,
        };
      });

      const order = await apiClient.orders.create({
        items: orderItems,
        shipping_address: `${shippingData.province}، ${shippingData.city}، ${shippingData.address}`,
        postal_code: shippingData.postalCode.replace(/\s+/g, ''),
        recipient_name: shippingData.fullName,
        recipient_phone: shippingData.phone.replace(/\s+/g, ''),
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      });

      const callbackUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/checkout/callback`
        : 'http://localhost:3000/checkout/callback';

      const payRes = await apiClient.payment.init(
        order.order_id,
        selectedGateway,
        callbackUrl
      );

      const redirectUrl = payRes.gateway_redirect_url;
      if (payRes.payment_token?.startsWith('SBX-') || redirectUrl?.includes('gateway.shaparak.ir')) {
        try {
          const urlObj = new URL(redirectUrl);
          const redirectBase = urlObj.searchParams.get('redirect') || `${window.location.origin}/checkout/callback`;
          const authority = urlObj.searchParams.get('Authority') || payRes.payment_token;
          const status = urlObj.searchParams.get('Status') || 'OK';
          const callbackTarget = `${redirectBase}${redirectBase.includes('?') ? '&' : '?'}Authority=${encodeURIComponent(authority)}&Status=${encodeURIComponent(status)}`;
          window.location.href = callbackTarget;
        } catch {
          window.location.href = `/checkout/callback?Authority=${encodeURIComponent(payRes.payment_token)}&Status=OK`;
        }
      } else if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('نشانی انتقال به درگاه پرداخت از سرور دریافت نشد.');
      }
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      const isAuthErr = err.message?.includes('401') || err.message?.includes('Not authenticated');
      if (isAuthErr) {
        setPaymentError('برای اتصال به درگاه شاپرک و نهایی‌سازی سفارش، لطفاً ابتدا وارد حساب کاربری خود شوید.');
      } else {
        setPaymentError(err.message || 'خطا در برقراری ارتباط با درگاه پرداخت بانکی. لطفاً مجدداً تلاش فرمایید.');
      }
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0D0E] text-book-text dark:text-stone-100 flex flex-col font-sans transition-colors">

      {/* Checkout Minimal Header */}
      <header className="border-b border-book-border dark:border-[#22242A] bg-white/80 dark:bg-[#141518]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-book-accent hover:opacity-80 transition group">
            <div className="w-9 h-9 rounded-2xl bg-book-accent text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="text-start">
              <span className="font-bold text-xs sm:text-sm block text-book-text dark:text-white">
                {dict.checkout_header_title || 'پایگاه علمی و انتشاراتی'}
              </span>
              <span className="text-[11px] sm:text-xs text-book-subtext dark:text-stone-400">
                {dict.checkout_header_sub || 'حجت الاسلام دکتر زنجیر زن حسینی'}
              </span>
            </div>
          </Link>

          {/* Stepper Progress Badges */}
          <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm">
            <span className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-bold transition ${
              step >= 1 ? 'bg-book-accent text-white shadow-xs' : 'bg-stone-200 dark:bg-[#18191D] text-stone-500'
            }`}>
              <span>{dict.checkout_step_cart || '۱. سبد خرید'}</span>
            </span>
            <span className="text-stone-400">←</span>
            <span className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-bold transition ${
              step >= 2 ? 'bg-book-accent text-white shadow-xs' : 'bg-stone-200 dark:bg-[#18191D] text-stone-500'
            }`}>
              <span>{dict.checkout_step_shipping || '۲. اطلاعات گیرنده'}</span>
            </span>
            <span className="text-stone-400">←</span>
            <span className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-bold transition ${
              step >= 3 ? 'bg-book-accent text-white shadow-xs' : 'bg-stone-200 dark:bg-[#18191D] text-stone-500'
            }`}>
              <span>{dict.checkout_step_gateway || '۳. درگاه شاپرک'}</span>
            </span>
          </div>

          <Link
            href="/"
            className="text-xs sm:text-sm font-bold text-book-subtext hover:text-book-text dark:text-stone-400 dark:hover:text-stone-200 transition flex items-center gap-1"
          >
            <span>{dict.checkout_btn_home || 'صفحه اصلی'}</span>
          </Link>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">

        {/* Loading state before client mount */}
        {!isMounted ? (
          <div className="bg-white dark:bg-[#141518] rounded-xl p-12 text-center border border-book-border dark:border-[#22242A] shadow-xs">
            <RefreshCw className="w-8 h-8 text-[#8A532B] dark:text-[#C58B43] animate-spin mx-auto mb-3" />
            <p className="text-xs sm:text-sm text-book-subtext dark:text-stone-400">در حال فراخوانی سبد خرید...</p>
          </div>
        ) : (
          <>
            {/* STEP 1: CART REVIEW & COUPONS */}
            {step === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-book-border dark:border-[#22242A]">
                    <h2 className="text-sm sm:text-base font-bold text-book-text dark:text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#8A532B]" />
                      <span>{dict.cart_title || 'سبد خرید و ثبت‌نام‌ها'}</span>
                    </h2>
                    <span className="text-xs sm:text-sm font-bold text-book-subtext dark:text-stone-400 font-num">
                      {toLocale(items.length.toString())} {dict.books_count_suffix || 'مورد'}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className="bg-white dark:bg-[#141518] rounded-xl p-8 sm:p-12 text-center border border-book-border dark:border-[#22242A] space-y-4 shadow-xs">
                      <ShoppingBag className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
                      <p className="text-sm font-bold text-book-subtext dark:text-stone-400">
                        {dict.cart_empty || 'سبد خرید شما در حال حاضر خالی است.'}
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <Link
                          href="/courses"
                          className="inline-flex px-6 py-3 rounded-full bg-[#8A532B] hover:bg-[#724424] text-white text-xs sm:text-sm font-bold shadow-xs transition"
                        >
                          {dict.hero_btn_courses || 'مشاهده دوره‌ها'}
                        </Link>
                        <Link
                          href="/books"
                          className="inline-flex px-6 py-3 rounded-full border border-book-border dark:border-[#22242A] hover:bg-stone-100 dark:hover:bg-zinc-800 text-book-text dark:text-white text-xs sm:text-sm font-bold transition"
                        >
                          مشاهده کتب و آثار
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map(item => (
                        <div
                          key={item.id}
                          className="bg-white dark:bg-[#141518] rounded-xl p-4 sm:p-5 border border-book-border dark:border-[#22242A] shadow-xs flex items-center justify-between gap-4 transition hover:border-[#8A532B]/40"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#8A532B]/10 border border-[#8A532B]/20 text-[#8A532B] flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 text-start">
                              <h4 className="text-xs sm:text-sm font-bold text-book-text dark:text-white truncate">
                                {item.title}
                              </h4>
                              <span className="text-[11px] sm:text-xs text-book-subtext dark:text-stone-400 block">
                                {item.type === 'book' || item.itemType === 'book_print' ? dict.book_binding_spec : dict.courses_section_badge}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-[#8A532B] dark:text-[#C58B43] font-num">
                              {item.price}
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 rounded-lg text-stone-400 hover:text-[#8A532B] hover:bg-stone-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title={dict.cart_remove_btn || 'حذف'}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Coupon Box */}
                      <div className="bg-white dark:bg-[#141518] rounded-xl p-4 border border-book-border dark:border-[#22242A] shadow-xs space-y-2">
                        <label className="text-xs sm:text-sm font-bold text-book-text dark:text-white flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#8A532B]" />
                          <span>{dict.checkout_coupon_label || 'کد تخفیف دانشجویی:'}</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="مثال: HEKMAT20 یا ZANJIRZAN"
                            value={couponCode}
                            onChange={e => setCouponCode(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-lg border border-book-border dark:border-zinc-700 bg-transparent text-xs sm:text-sm font-mono uppercase outline-none focus:border-[#8A532B] transition"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            className="px-5 py-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs sm:text-sm font-bold transition cursor-pointer"
                          >
                            {dict.checkout_coupon_apply || 'اعمال کد'}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-xs text-[#8A532B] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{couponError}</span>
                          </p>
                        )}
                        {appliedCoupon && (
                          <p className="text-xs text-[#8A532B] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{dict.checkout_coupon_success || 'کد تخفیف اعمال شد:'} ({appliedCoupon.code} - {appliedCoupon.percent}٪)</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Summary Sidebar */}
                <div className="bg-white dark:bg-[#141518] rounded-xl p-6 border border-book-border dark:border-[#22242A] shadow-xs space-y-5 h-fit text-start">
                  <h3 className="text-sm sm:text-base font-bold text-book-text dark:text-white border-b border-book-border dark:border-[#22242A] pb-3">
                    {dict.checkout_summary_title || 'خلاصه سفارش و پرداخت'}
                  </h3>

                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between text-book-subtext dark:text-stone-400">
                      <span>{dict.checkout_raw_total || 'مجموع اقلام:'}</span>
                      <span className="font-bold font-num text-book-text dark:text-white">{formatPrice(rawTotal)}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-[#8A532B] dark:text-[#C58B43] font-bold">
                        <span>{dict.checkout_discount || 'تخفیف اعمال‌شده:'}</span>
                        <span className="font-num">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-book-subtext dark:text-stone-400">
                      <span>{dict.checkout_shipping_fee || 'هزینه ارسال پستی:'}</span>
                      <span className="font-bold text-[#8A532B] dark:text-[#C58B43]">{dict.checkout_shipping_free || 'رایگان'}</span>
                    </div>

                    <div className="pt-3 border-t border-book-border dark:border-[#22242A] flex justify-between items-center">
                      <span className="font-bold text-sm sm:text-base text-book-text dark:text-white">
                        {dict.checkout_payable || 'مبلغ پرداختی:'}
                      </span>
                      <span className="font-bold text-base sm:text-lg text-[#8A532B] dark:text-[#C58B43] font-num">
                        {formatPrice(payableTotal)}
                      </span>
                    </div>
                  </div>

                  {!user && !isAuthenticated ? (
                    <button
                      onClick={() => router.push('/login?redirect=/checkout')}
                      className="w-full py-3.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{dict.checkout_btn_login_to_continue || 'ورود به حساب کاربری و ادامه خرید'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleGoToShipping}
                      disabled={items.length === 0}
                      className="w-full py-3.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] disabled:opacity-40 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{dict.checkout_btn_continue_shipping || 'ادامه و ثبت آدرس پستی'}</span>
                      <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: SHIPPING INFORMATION */}
            {step === 2 && (
              <div className="max-w-2xl mx-auto bg-white dark:bg-[#141518] rounded-xl p-6 sm:p-8 border border-book-border dark:border-[#22242A] shadow-xs space-y-6 text-start">
                <div className="flex items-center justify-between border-b border-book-border dark:border-[#22242A] pb-3">
                  <h2 className="text-sm sm:text-base font-bold text-book-text dark:text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#8A532B]" />
                    <span>{dict.checkout_step_shipping || 'مشخصات و آدرس پستی تحویل'}</span>
                  </h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs sm:text-sm font-bold text-book-subtext hover:text-book-text dark:text-stone-400 dark:hover:text-stone-200"
                  >
                    ← {currentLang === 'en' ? 'Back to Bag' : currentLang === 'ar' ? 'العودة للسلة' : 'بازگشت به سبد'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-book-text dark:text-white block mb-1.5">
                      {dict.checkout_shipping_name || 'نام و نام‌خانوادگی گیرنده:'}
                    </label>
                    <input
                      type="text"
                      value={shippingData.fullName}
                      onChange={e => setShippingData({ ...shippingData, fullName: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-book-border dark:border-zinc-700 bg-transparent text-xs sm:text-sm outline-none focus:border-[#8A532B] transition"
                    />
                    {shippingErrors.fullName && <p className="text-xs text-[#8A532B] mt-1">{shippingErrors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-bold text-book-text dark:text-white block mb-1.5">
                        {dict.checkout_shipping_phone || 'شماره تماس همراه:'}
                      </label>
                      <input
                        type="tel"
                        value={shippingData.phone}
                        onChange={e => setShippingData({ ...shippingData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-book-border dark:border-zinc-700 bg-transparent text-xs sm:text-sm font-num outline-none focus:border-[#8A532B] transition"
                      />
                      {shippingErrors.phone && <p className="text-xs text-[#8A532B] mt-1">{shippingErrors.phone}</p>}
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-bold text-book-text dark:text-white block mb-1.5">
                        {dict.checkout_shipping_postal || 'کد پستی ۱۰ رقمی:'}
                      </label>
                      <input
                        type="text"
                        value={shippingData.postalCode}
                        onChange={e => setShippingData({ ...shippingData, postalCode: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-book-border dark:border-zinc-700 bg-transparent text-xs sm:text-sm font-num outline-none focus:border-[#8A532B] transition"
                      />
                      {shippingErrors.postalCode && <p className="text-xs text-[#8A532B] mt-1">{shippingErrors.postalCode}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-bold text-book-text dark:text-white block mb-1.5">
                        {dict.checkout_shipping_province || 'استان:'}
                      </label>
                      <input
                        type="text"
                        value={shippingData.province}
                        onChange={e => setShippingData({ ...shippingData, province: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-book-border dark:border-zinc-700 bg-transparent text-xs sm:text-sm outline-none focus:border-[#8A532B] transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-bold text-book-text dark:text-white block mb-1.5">
                        {dict.checkout_shipping_city || 'شهر:'}
                      </label>
                      <input
                        type="text"
                        value={shippingData.city}
                        onChange={e => setShippingData({ ...shippingData, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-book-border dark:border-zinc-700 bg-transparent text-xs sm:text-sm outline-none focus:border-[#8A532B] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-bold text-book-text dark:text-white block mb-1.5">
                      {dict.checkout_shipping_address || 'نشانی پستی دقیق جهت تحویل کتاب:'}
                    </label>
                    <textarea
                      rows={3}
                      value={shippingData.address}
                      onChange={e => setShippingData({ ...shippingData, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-book-border dark:border-zinc-700 bg-transparent text-xs sm:text-sm outline-none focus:border-[#8A532B] resize-none transition"
                    />
                    {shippingErrors.address && <p className="text-xs text-[#8A532B] mt-1">{shippingErrors.address}</p>}
                  </div>

                  <button
                    onClick={handleGoToPayment}
                    className="w-full py-3.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{dict.checkout_btn_to_payment || 'انتقال به درگاه پرداخت'}</span>
                    <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SHAPARAK PAYMENT GATEWAY SELECTOR */}
            {step === 3 && (
              <div className="max-w-xl mx-auto bg-white dark:bg-[#141518] rounded-xl p-6 sm:p-8 border border-book-border dark:border-[#22242A] shadow-md space-y-6 text-start">
                <div className="flex items-center justify-between border-b border-book-border dark:border-[#22242A] pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#8A532B] dark:text-[#C58B43]" />
                    <h2 className="text-sm sm:text-base font-bold text-book-text dark:text-white">
                      {dict.checkout_gateway_title || 'انتخاب درگاه پرداخت شاپرک'}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43] bg-[#8A532B]/10 dark:bg-[#C58B43]/15 px-3 py-1 rounded-full">
                    شبکه الکترونیکی پرداخت (شاپرک)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#FBF9F4] dark:bg-[#18191D] border border-book-border dark:border-[#22242A] flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold text-book-subtext dark:text-stone-400">
                    {dict.checkout_payable || 'مبلغ قابل پرداخت:'}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#8A532B] dark:text-[#C58B43] font-num">
                    {formatPrice(payableTotal)}
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="text-xs sm:text-sm font-bold text-book-text dark:text-white block">
                    درگاه بانکی مورد نظر خود را انتخاب نمایید:
                  </label>

                  {/* Zarinpal */}
                  <div
                    onClick={() => setSelectedGateway('zarinpal')}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                      selectedGateway === 'zarinpal'
                        ? 'border-[#8A532B] dark:border-[#C58B43] bg-[#8A532B]/5 dark:bg-[#C58B43]/10 shadow-xs'
                        : 'border-book-border dark:border-zinc-700 hover:border-stone-400 dark:hover:border-zinc-600 bg-white dark:bg-[#141518]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedGateway === 'zarinpal'
                          ? 'border-[#8A532B] dark:border-[#C58B43]'
                          : 'border-stone-400 dark:border-zinc-600'
                      }`}>
                        {selectedGateway === 'zarinpal' && (
                          <div className="w-2 h-2 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-book-text dark:text-white">
                          درگاه پرداخت زرین‌پال (پرداخت سریع شتابی)
                        </div>
                        <div className="text-[11px] sm:text-xs text-book-subtext dark:text-stone-400">
                          پشتیبانی از تمامی کارت‌های عضو شبکه شتاب با تسویه آنی
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-book-subtext dark:text-stone-400 border border-stone-200 dark:border-[#22242A] px-2 py-0.5 rounded text-start" dir="ltr">
                      ZarinPal
                    </span>
                  </div>

                  {/* Mellat */}
                  <div
                    onClick={() => setSelectedGateway('mellat')}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                      selectedGateway === 'mellat'
                        ? 'border-[#8A532B] dark:border-[#C58B43] bg-[#8A532B]/5 dark:bg-[#C58B43]/10 shadow-xs'
                        : 'border-book-border dark:border-zinc-700 hover:border-stone-400 dark:hover:border-zinc-600 bg-white dark:bg-[#141518]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedGateway === 'mellat'
                          ? 'border-[#8A532B] dark:border-[#C58B43]'
                          : 'border-stone-400 dark:border-zinc-600'
                      }`}>
                        {selectedGateway === 'mellat' && (
                          <div className="w-2 h-2 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-book-text dark:text-white">
                          درگاه به‌پرداخت ملت (شاپرک)
                        </div>
                        <div className="text-[11px] sm:text-xs text-book-subtext dark:text-stone-400">
                          درگاه مستقیم شاپرک بانک ملت با تاییدیه فوری
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-book-subtext dark:text-stone-400 border border-stone-200 dark:border-[#22242A] px-2 py-0.5 rounded text-start" dir="ltr">
                      Behpardakht
                    </span>
                  </div>

                  {/* Saman */}
                  <div
                    onClick={() => setSelectedGateway('saman')}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                      selectedGateway === 'saman'
                        ? 'border-[#8A532B] dark:border-[#C58B43] bg-[#8A532B]/5 dark:bg-[#C58B43]/10 shadow-xs'
                        : 'border-book-border dark:border-zinc-700 hover:border-stone-400 dark:hover:border-zinc-600 bg-white dark:bg-[#141518]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedGateway === 'saman'
                          ? 'border-[#8A532B] dark:border-[#C58B43]'
                          : 'border-stone-400 dark:border-zinc-600'
                      }`}>
                        {selectedGateway === 'saman' && (
                          <div className="w-2 h-2 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-book-text dark:text-white">
                          درگاه پرداخت الکترونیک سامان (سپ)
                        </div>
                        <div className="text-[11px] sm:text-xs text-book-subtext dark:text-stone-400">
                          درگاه شاپرکی بانک سامان با رمزنگاری پیشرفته
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-book-subtext dark:text-stone-400 border border-stone-200 dark:border-[#22242A] px-2 py-0.5 rounded text-start" dir="ltr">
                      SEP Saman
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-stone-200 dark:border-[#22242A] bg-[#FAF8F5]/80 dark:bg-[#18191D] flex items-start gap-2.5 text-xs text-book-subtext dark:text-stone-400">
                  <ShieldCheck className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0 mt-0.5" />
                  <span>
                    تراکنش در بستر امن پروتکل شاپرک انجام می‌شود. اطلاعات کارت بانکی منحصراً در سرورهای مرکزی شاپرک ثبت می‌شود و در پایگاه «حیات» ذخیره نمی‌شود.
                  </span>
                </div>

                {paymentError && (
                  <div className="p-3.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-xs text-red-700 dark:text-red-400 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{paymentError}</span>
                    </div>
                    {!user && !isAuthenticated && (
                      <Link
                        href="/login?redirect=/checkout"
                        className="inline-flex items-center gap-1.5 font-bold text-[#8A532B] dark:text-[#C58B43] hover:underline pt-1 text-xs"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>ورود به حساب کاربری و بازگشت به پرداخت</span>
                      </Link>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleInitiatePayment}
                    disabled={isProcessingPayment || items.length === 0}
                    className="w-full py-3.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] dark:bg-[#C58B43] dark:hover:bg-[#a57335] disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>در حال انتقال به درگاه شاپرک...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>اتصال به درگاه و پرداخت</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setStep(2)}
                    disabled={isProcessingPayment}
                    className="w-full py-2.5 text-xs font-bold text-book-subtext hover:text-book-text dark:text-stone-400 dark:hover:text-stone-200 transition text-center"
                  >
                    ویرایش اطلاعات ارسال
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
