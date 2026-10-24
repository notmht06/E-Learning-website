'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ArrowLeft, Award, Loader2, QrCode, Copy, Check } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/services/apiClient';
import { toLocaleDigits } from '@/lib/data';
import { SCHOLAR_NAME } from '@/lib/constants';

function formatCertificateDate(dateStr?: string, lang: string = 'fa'): string {
  if (!dateStr) return '';
  // If already in Persian Solar Hijri format like "۱۴۰۳/۰۶/۲۱" or "1403/06/21"
  if (/^[\d۰-۹]{4}\/[\d۰-۹]{1,2}\/[\d۰-۹]{1,2}$/.test(dateStr.trim())) {
    return toLocaleDigits(dateStr, lang as any);
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      if (lang === 'fa') {
        return new Intl.DateTimeFormat('fa-IR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(d);
      }
      return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US');
    }
  } catch (dateErr) {
    console.debug('Intl date format fallback:', dateErr);
  }
  return toLocaleDigits(dateStr.split('T')[0], lang as any);
}

export default function CertificateVerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  let safeCertCode = '';
  try {
    safeCertCode = decodeURIComponent(resolvedParams.code || '').trim();
  } catch (uriErr) {
    console.debug('URI decode error in verify page:', uriErr);
    safeCertCode = (resolvedParams.code || '').trim();
  }

  const { currentLang } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [certData, setCertData] = useState<{
    valid: boolean;
    certificate_code?: string;
    student_name?: string;
    course_id?: string;
    score?: string;
    issued_at?: string;
    institute?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkCertificate() {
      if (!safeCertCode) {
        if (mounted) {
          setCertData({
            valid: false,
            message: 'کد استعلام گواهینامه ارائه نشده است.',
          });
          setIsLoading(false);
        }
        return;
      }

      // 1. Query real API backend verification via typed apiClient
      try {
        const apiData = await apiClient.certificates.verify(safeCertCode);
        if (mounted && apiData && apiData.valid !== undefined) {
          setCertData({
            valid: apiData.valid,
            certificate_code: apiData.certificate_code || safeCertCode,
            student_name: apiData.student_name,
            course_id: apiData.course_title || apiData.course_id,
            score: apiData.score,
            issued_at: apiData.issued_at,
            institute: apiData.institute,
            message: apiData.message || (apiData.valid ? 'اصالت این گواهینامه مورد تایید رسمی است.' : 'گواهینامه مورد نظر در سامانه حیات یافت نشد.'),
          });
          setIsLoading(false);
          return;
        }
      } catch (apiErr) {
        console.warn('Certificate API verification query failed, falling back:', apiErr);
      }

      // 2. Client-side fallback: any unrecognized code is invalid
      if (!mounted) return;
      setCertData({
        valid: false,
        message: 'کد گواهینامه نامعتبر است یا در آرشیو حیات یافت نشد.',
      });
      setIsLoading(false);
    }

    const timer = setTimeout(() => {
      checkCertificate();
    }, 400);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [safeCertCode]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      try {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (clipErr) {
        console.warn('Clipboard write failed:', clipErr);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#0C0D0E] dark:text-[#FAF8F5] transition-colors pb-12 font-sans">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto px-4 py-10 w-full flex items-center justify-center">
        <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-3xl p-6 sm:p-8 w-full space-y-6 shadow-xl text-start">
          
          {/* Header */}
          <div className="text-center space-y-3 border-b border-[#E6E1D8] dark:border-[#22242A] pb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center mx-auto border border-[#8A532B]/20 shadow-xs">
              <Award className="w-7 h-7" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              {currentLang === 'en'
                ? 'Academic Certificate Authentication'
                : currentLang === 'ar'
                ? 'التحقق من صحة الشهادة الأكاديمية'
                : 'سامانه استعلام اصالت گواهینامه علمی'}
            </h1>
            <p className="text-xs text-zinc-500 font-mono flex items-center justify-center gap-1.5" dir="rtl">
              <span>{currentLang === 'en' ? 'Code:' : currentLang === 'ar' ? 'رمز الشهادة:' : 'کد استعلام:'}</span>
              <span className="font-bold text-[#8A532B] dark:text-[#C58B43] font-mono" dir="ltr">{safeCertCode}</span>
            </p>
          </div>

          {/* Body Content */}
          {isLoading ? (
            <div className="py-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#8A532B]" />
              <span>در حال استعلام اصالت گواهینامه از پایگاه داده حیات...</span>
            </div>
          ) : certData?.valid ? (
            <div className="space-y-5">
              {/* Approval Banner */}
              <div className="p-4 rounded-2xl bg-[#8A532B]/10 border border-[#8A532B]/30 text-[#8A532B] dark:text-[#E6CA85] text-xs font-bold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{certData.message}</span>
              </div>

              {/* Certificate Details */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">نام دانش‌پژوه:</span>
                  <strong className="text-[#0C0D0E] dark:text-[#FAF8F5] font-bold text-sm">
                    {certData.student_name}
                  </strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">عنوان دوره تخصصی:</span>
                  <strong className="text-[#0C0D0E] dark:text-[#FAF8F5] font-semibold text-end max-w-[65%]">
                    {certData.course_id}
                  </strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">ارزیابی نهایی:</span>
                  <strong className="text-[#8A532B] dark:text-[#C58B43] font-bold">
                    {certData.score}
                  </strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">تاریخ صدور:</span>
                  <strong className="font-num text-zinc-700 dark:text-zinc-300">
                    {formatCertificateDate(certData.issued_at, currentLang)}
                  </strong>
                </div>

                <div className="pt-3 border-t border-[#E6E1D8] dark:border-[#22242A] flex justify-between items-start gap-2">
                  <span className="text-zinc-500 shrink-0">مرجع صادرکننده:</span>
                  <strong className="text-[11px] text-end text-zinc-800 dark:text-zinc-200">
                    {certData.institute}
                  </strong>
                </div>
              </div>

              {/* QR Code & Share Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-2xs">
                    <QrCode className="w-5 h-5 text-[#8A532B]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-zinc-800 dark:text-zinc-200">
                      پیوند استعلام مستقیم
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      قابل استعلام با اسکن بارکد پاسخ‌سریع (QR)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-[#8A532B] text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی لینک</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-950/10 border border-rose-800/30 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{certData?.message}</span>
              </div>
            </div>
          )}

          {/* Action Link */}
          <div className="pt-2">
            <Link
              href="/"
              className="w-full py-3.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>بازگشت به صفحه نخست حیات</span>
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
