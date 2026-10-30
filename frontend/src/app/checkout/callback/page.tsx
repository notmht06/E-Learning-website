'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Printer,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Clock,
  CreditCard,
  Hash,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

interface ReceiptData {
  referenceId: string;
  orderId: string;
  amount: number;
  cardMask: string;
  paidAt: string;
}

function toPersianDigits(input: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

function formatTomanPrice(amount: number): string {
  return `${toPersianDigits(amount.toLocaleString('fa-IR'))} تومان`;
}

function formatPersianDate(dateStr?: string): string {
  try {
    const date = dateStr ? new Date(dateStr) : new Date();
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  } catch (dateErr) {
    console.debug('Failed to format Persian date, using fallback:', dateErr);
    return dateStr || '';
  }
}

function CallbackLoadingFallback() {
  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-[#141518] rounded-2xl border border-book-border dark:border-[#22242A] shadow-sm text-center space-y-4">
      <RefreshCw className="w-10 h-10 text-[#8A532B] dark:text-[#C58B43] animate-spin mx-auto" />
      <h2 className="text-base font-bold text-book-text dark:text-white">
        در حال اتصال به سرور و تایید تراکنش...
      </h2>
      <p className="text-xs text-book-subtext dark:text-stone-400">
        لطفاً شکیبا باشید و از بستن یا بازخوانی صفحه خودداری فرمایید.
      </p>
    </div>
  );
}

function CallbackContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { localizeHref } = useLanguage();

  const authority = searchParams.get('Authority') || searchParams.get('authority') || '';
  const rawStatus = searchParams.get('Status') || searchParams.get('status') || '';
  const isBankOk = rawStatus.trim().toUpperCase() === 'OK';

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  // StrictMode duplicate protection
  const isVerifyingRef = useRef<boolean>(false);

  useEffect(() => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;

    if (!authority) {
      setIsLoading(false);
      setIsSuccess(false);
      setErrorMessage('شناسه پرداخت (Authority) در اطلاعات بازگشتی از بانک یافت نشد.');
      return;
    }

    const verify = async () => {
      setIsLoading(true);
      try {
        const verifyStatus = isBankOk ? 'OK' : 'NOK';
        const res = await apiClient.payment.verify(authority, verifyStatus);

        if (res && res.success) {
          setIsSuccess(true);
          setReceipt({
            referenceId: res.reference_id,
            orderId: res.order_id,
            amount: res.amount,
            cardMask: res.card_mask,
            paidAt: res.paid_at,
          });

          // Clear cart across context and localStorage
          clearCart();
          if (typeof window !== 'undefined') {
            localStorage.removeItem('zan_cart');
            localStorage.removeItem('zan_cart_items');
          }
        } else {
          setIsSuccess(false);
          setErrorMessage(
            !isBankOk
              ? 'تراکنش بانکی توسط شما لغو شد یا درگاه شتاب تراکنش را تایید نکرد.'
              : 'اعتبارسنجی تراکنش توسط درگاه شاپرک با موفقیت انجام نشد.'
          );
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setIsSuccess(false);
        setErrorMessage(
          err.message || 'خطا در ارتباط با سرور شاپرک جهت تایید پرداخت.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [authority, isBankOk, clearCart]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12">
      {isLoading && (
        <div className="p-8 sm:p-12 bg-white dark:bg-[#141518] rounded-2xl border border-book-border dark:border-[#22242A] shadow-sm text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-[#8A532B] dark:text-[#C58B43] animate-spin mx-auto" />
          <h2 className="text-base sm:text-lg font-bold text-book-text dark:text-white">
            در حال تایید و ثبت نهایی تراکنش با شبکه شاپرک...
          </h2>
          <p className="text-xs sm:text-sm text-book-subtext dark:text-stone-400">
            اطلاعات فاکتور در حال تطبیق با پایگاه داده است. لطفاً صفحه را نبندید.
          </p>
        </div>
      )}

      {!isLoading && isSuccess && receipt && (
        <div className="space-y-6">
          {/* Header Status Card */}
          <div className="p-6 bg-white dark:bg-[#141518] rounded-2xl border border-[#8A532B]/30 dark:border-[#C58B43]/30 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-book-text dark:text-white">
              پرداخت با موفقیت انجام شد
            </h1>
            <p className="text-xs sm:text-sm text-book-subtext dark:text-stone-400 max-w-md mx-auto">
              سفارش شما در پایگاه «حیات» ثبت شد و دسترسی به محتوای خریداری‌شده در پرونده تحصیلی شما فعال شد.
            </p>
          </div>

          {/* Structured Receipt Document (printable) */}
          <div className="p-6 sm:p-8 bg-white dark:bg-[#141518] rounded-2xl border border-book-border dark:border-[#22242A] shadow-sm space-y-6 text-start print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
            <div className="flex items-center justify-between border-b border-book-border dark:border-[#22242A] pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#8A532B] dark:text-[#C58B43]" />
                <h2 className="text-sm sm:text-base font-bold text-book-text dark:text-white print:text-black">
                  رسید الکترونیکی پرداخت شاپرک
                </h2>
              </div>
              <span className="text-xs font-mono text-book-subtext dark:text-stone-400 print:text-stone-600">
                «حیات»
              </span>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-[#22242A]/60">
                <span className="text-book-subtext dark:text-stone-400 flex items-center gap-2 print:text-stone-600">
                  <Hash className="w-4 h-4 text-stone-400" />
                  شماره سفارش (فاکتور):
                </span>
                <span className="font-bold font-mono text-book-text dark:text-white print:text-black">
                  {toPersianDigits(receipt.orderId)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-[#22242A]/60">
                <span className="text-book-subtext dark:text-stone-400 flex items-center gap-2 print:text-stone-600">
                  <ShieldCheck className="w-4 h-4 text-stone-400" />
                  شماره پیگیری بانکی (مرجع):
                </span>
                <span className="font-bold font-mono text-[#8A532B] dark:text-[#C58B43] print:text-stone-800">
                  {toPersianDigits(receipt.referenceId)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-[#22242A]/60">
                <span className="text-book-subtext dark:text-stone-400 flex items-center gap-2 print:text-stone-600">
                  <CreditCard className="w-4 h-4 text-stone-400" />
                  مبلغ پرداخت‌شده:
                </span>
                <span className="font-bold text-base text-[#8A532B] dark:text-[#C58B43] font-num print:text-stone-800">
                  {formatTomanPrice(receipt.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-[#22242A]/60">
                <span className="text-book-subtext dark:text-stone-400 flex items-center gap-2 print:text-stone-600">
                  <CreditCard className="w-4 h-4 text-stone-400" />
                  شماره کارت پرداخت‌کننده:
                </span>
                <span className="font-mono text-book-text dark:text-white print:text-black inline-block" dir="ltr">
                  {toPersianDigits(receipt.cardMask || '۶۰۳۷-۹۹**-****-۱۴۰۳')}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-[#22242A]/60">
                <span className="text-book-subtext dark:text-stone-400 flex items-center gap-2 print:text-stone-600">
                  <Clock className="w-4 h-4 text-stone-400" />
                  زمان ثبت تراکنش:
                </span>
                <span className="text-book-text dark:text-white font-num print:text-black">
                  {toPersianDigits(formatPersianDate(receipt.paidAt))}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-book-subtext dark:text-stone-400 print:text-stone-600">
                  وضعیت نهایی:
                </span>
                <span className="font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                  موفق و تاییدشده توسط شاپرک
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-stone-200 dark:border-[#22242A] bg-[#FAF8F5]/80 dark:bg-[#18191D] text-xs text-book-subtext dark:text-stone-400 print:text-stone-600 print:bg-stone-50">
              این رسید به منزله سند پرداخت رسمی در پایگاه «حیات» متعلق به حجت الاسلام دکتر زنجیر زن حسینی است. لطفاً شماره پیگیری بانکی را جهت مراجعات بعدی نزد خود نگه دارید.
            </div>
          </div>

          {/* Action buttons (hidden on print) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-3.5 rounded-xl border border-book-border dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-book-text dark:text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ رسید پرداخت</span>
            </button>

            <Link
              href={localizeHref('/dashboard')}
              className="flex-1 py-3.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] dark:bg-[#C58B43] dark:hover:bg-[#a57335] text-white text-xs sm:text-sm font-bold shadow-xs transition text-center flex items-center justify-center gap-2"
            >
              <span>ورود به پنل کاربری و مشاهده دوره‌ها</span>
            </Link>

            <Link
              href={localizeHref('/')}
              className="py-3.5 px-6 rounded-xl border border-book-border dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-book-subtext hover:text-book-text dark:text-stone-400 dark:hover:text-stone-200 text-xs sm:text-sm font-bold transition text-center"
            >
              <span>صفحه اصلی</span>
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !isSuccess && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 bg-white dark:bg-[#141518] rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-book-text dark:text-white">
                {!isBankOk ? 'انصراف از پرداخت بانکی' : 'تراکنش ناموفق'}
              </h1>
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                {errorMessage || 'پرداخت توسط درگاه بانکی تایید نشد.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#18191D] border border-book-border dark:border-[#22242A] text-xs text-book-subtext dark:text-stone-400 text-start space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-700 dark:text-stone-300">
                <AlertCircle className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
                <span>نکته مهم بانکی:</span>
              </div>
              <p>
                در صورتی که وجه از حساب شما کسر شده باشد، طبق ضوابط شبکه شاپرک بانک مرکزی جمهوری اسلامی ایران، مبلغ کسرشده حداکثر ظرف مدت ۷۲ ساعت کاری به صورت خودکار توسط بانک عامل به حساب مبدأ بازگردانده می‌شود.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Link
                href={localizeHref('/checkout')}
                className="flex-1 py-3.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] dark:bg-[#C58B43] dark:hover:bg-[#a57335] text-white text-xs sm:text-sm font-bold shadow-xs transition text-center flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>تلاش مجدد و بازگشت به سبد خرید</span>
              </Link>
              <Link
                href={localizeHref('/')}
                className="flex-1 py-3.5 rounded-xl border border-book-border dark:border-[#22242A] hover:bg-stone-100 dark:hover:bg-zinc-800 text-book-text dark:text-white text-xs sm:text-sm font-bold transition text-center"
              >
                صفحه اصلی
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutCallbackPage() {
  const { localizeHref } = useLanguage();
  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0D0E] text-book-text dark:text-stone-100 flex flex-col font-sans transition-colors">
      {/* Minimal Header */}
      <header className="border-b border-book-border dark:border-[#22242A] bg-white/80 dark:bg-[#141518]/90 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={localizeHref('/')} className="flex items-center gap-3 text-book-accent hover:opacity-80 transition group">
            <div className="w-9 h-9 rounded-2xl bg-[#8A532B] dark:bg-[#C58B43] text-white flex items-center justify-center font-bold text-sm shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="text-start">
              <span className="font-bold text-xs sm:text-sm block text-book-text dark:text-white">
                سامانه پرداخت «حیات»
              </span>
              <span className="text-[11px] sm:text-xs text-book-subtext dark:text-stone-400">
                حجت الاسلام دکتر زنجیر زن حسینی
              </span>
            </div>
          </Link>
          <Link
            href={localizeHref('/')}
            className="text-xs sm:text-sm font-bold text-book-subtext hover:text-book-text dark:text-stone-400 dark:hover:text-stone-200 transition flex items-center gap-1"
          >
            <span>صفحه اصلی</span>
          </Link>
        </div>
      </header>

      {/* Main Container wrapped in Suspense */}
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<CallbackLoadingFallback />}>
          <CallbackContent />
        </Suspense>
      </main>
    </div>
  );
}
