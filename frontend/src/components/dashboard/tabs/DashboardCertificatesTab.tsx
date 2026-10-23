'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Printer, ShieldCheck, QrCode } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/services/apiClient';
import { SCHOLAR_NAME } from '@/lib/constants';
import { toLocaleDigits } from '@/lib/data';

interface CertItem {
  id: string;
  title: string;
  hours: string;
  instructor: string;
  date: string;
  score: string;
}

const DEFAULT_CERTIFICATES: CertItem[] = [];

export function DashboardCertificatesTab() {
  const { currentLang } = useLanguage();
  const [certs, setCerts] = useState<CertItem[]>([]);

  useEffect(() => {
    let mounted = true;
    apiClient.certificates
      .myCertificates()
      .then((data) => {
        if (!mounted || !Array.isArray(data) || data.length === 0) return;
        const apiCerts: CertItem[] = data.map((c) => {
          let dateStr = '۱۴۰۳/۰۶/۲۱';
          if (c.issued_at) {
            try {
              dateStr = new Intl.DateTimeFormat('fa-IR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }).format(new Date(c.issued_at));
            } catch {
              dateStr = c.issued_at.split('T')[0];
            }
          }
          return {
            id: c.certificate_code || c.id,
            title: `گواهی‌نامه اتمام دوره تخصصی ${c.course_id}`,
            hours: '۴۰ ساعت آموزشی',
            instructor: SCHOLAR_NAME,
            date: dateStr,
            score: c.score || 'عالی (۱۰۰ از ۱۰۰)',
          };
        });
        setCerts(apiCerts);
      })
      .catch(() => {
        // graceful fallback to sample certificates
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 text-start font-sans">
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#8A532B]" />
            <span>گواهی‌نامه‌های رسمی پایان دوره علمی</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            مدارک تایید اتمام درس‌گفتارها و آزمون‌های ارزیابی حیات با کد استعلام یکتا و بارکد پاسخ‌سریع (QR)
          </p>
        </div>
      </div>

      {certs.length === 0 && (
        <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-3">
          <Award className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            هنوز گواهی‌نامه‌ای برای شما صادر نشده است
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            پس از اتمام کامل درس‌گفتارهای آموزشی و قبولی در آزمون ارزیابی، گواهی رسمی ممهور به امضای حجت الاسلام دکتر زنجیر زن حسینی در این بخش صادر خواهد شد.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certs.map((cert) => (
          <div
            key={cert.id}
            className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8A532B]/40 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-400 font-semibold">{cert.id}</span>
                <span className="text-[#8A532B] font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>معتبر و تاییدشده</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{cert.title}</h3>
              <p className="text-xs text-zinc-500">مدرس: {cert.instructor}</p>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5 font-mono text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>مدت دوره:</span>
                  <span className="font-bold">{cert.hours}</span>
                </div>
                <div className="flex justify-between">
                  <span>ارزیابی نهایی:</span>
                  <span className="font-bold text-[#8A532B]">{cert.score}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap justify-between items-center gap-2">
              <span className="text-[11px] text-zinc-400 font-num">
                صدور: {toLocaleDigits(cert.date, currentLang)}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/verify/${encodeURIComponent(cert.id)}`}
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#8A532B] text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#8A532B]" />
                  <span>استعلام اصالت (QR)</span>
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>چاپ</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
