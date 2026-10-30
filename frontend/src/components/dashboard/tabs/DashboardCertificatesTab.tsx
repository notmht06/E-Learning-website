'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Printer, ShieldCheck, QrCode } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { apiClient } from '@/services/apiClient';
import { getScholarName } from '@/lib/constants';
import { toLocaleDigits, COURSE_ID_ALIASES } from '@/lib/data';

interface CertItem {
  id: string;
  courseId: string;
  title: string;
  hours: string;
  instructor: string;
  date: string;
  score: string;
}

export function DashboardCertificatesTab() {
  const { currentLang, localizeHref } = useLanguage();
  const { courses } = useData();
  const [certs, setCerts] = useState<CertItem[]>([]);

  useEffect(() => {
    let mounted = true;
    apiClient.certificates
      .myCertificates()
      .then((data) => {
        if (!mounted || !Array.isArray(data) || data.length === 0) return;
        const apiCerts: CertItem[] = data.map((c) => {
          let dateStr = '2024-09-11';
          if (c.issued_at) {
            try {
              const d = new Date(c.issued_at);
              if (currentLang === 'en') {
                dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
              } else if (currentLang === 'ar') {
                dateStr = d.toLocaleDateString('ar-SA');
              } else {
                dateStr = d.toLocaleDateString('fa-IR');
              }
            } catch (intlErr) {
              console.debug('Failed to format certificate date with Intl:', intlErr);
              dateStr = c.issued_at.split('T')[0];
            }
          }

          const rawCourseId = c.course_id || '';
          const canonicalId = COURSE_ID_ALIASES[rawCourseId] || rawCourseId;
          const courseObj = courses[canonicalId] || courses[rawCourseId];
          const courseTitle = courseObj
            ? (currentLang === 'en' && courseObj.title_en ? courseObj.title_en : currentLang === 'ar' && courseObj.title_ar ? courseObj.title_ar : courseObj.title_fa)
            : rawCourseId;

          const title = currentLang === 'en'
            ? `Official Certificate of Completion: ${courseTitle}`
            : currentLang === 'ar'
            ? `شهادة إتمام الدورة التخصصية: ${courseTitle}`
            : `گواهی‌نامه اتمام دوره تخصصی ${courseTitle}`;

          const hours = currentLang === 'en'
            ? `${toLocaleDigits(40, currentLang)} Academic Hours`
            : currentLang === 'ar'
            ? `${toLocaleDigits(40, currentLang)} ساعة تدريسية`
            : `${toLocaleDigits(40, currentLang)} ساعت آموزشی`;

          const score = currentLang === 'en'
            ? `Distinction (${toLocaleDigits(100, currentLang)} / ${toLocaleDigits(100, currentLang)})`
            : currentLang === 'ar'
            ? `ممتاز (${toLocaleDigits(100, currentLang)} من ${toLocaleDigits(100, currentLang)})`
            : `عالی (${toLocaleDigits(100, currentLang)} از ${toLocaleDigits(100, currentLang)})`;

          return {
            id: c.certificate_code || c.id,
            courseId: rawCourseId,
            title,
            hours,
            instructor: getScholarName(currentLang),
            date: dateStr,
            score: c.score ? toLocaleDigits(c.score, currentLang) : score,
          };
        });
        setCerts(apiCerts);
      })
      .catch((err) => {
        console.warn('Failed to load certificates from API:', err);
      });

    return () => {
      mounted = false;
    };
  }, [currentLang, courses]);

  const bannerTitle = currentLang === 'en'
    ? 'Official Scholarly Completion Certificates'
    : currentLang === 'ar'
    ? 'الشهادات الرسمية لاجتياز الدورات العلمية'
    : 'گواهی‌نامه‌های رسمی پایان دوره علمی';

  const bannerSub = currentLang === 'en'
    ? 'Verified academic completion credentials with immutable verification code and QR authentication'
    : currentLang === 'ar'
    ? 'وثائق معتمدة لاجتياز الحلقات الدراسية مع رمز استعلام موثق ورمز استجابة سريعة (QR)'
    : 'مدارک تایید اتمام درس‌گفتارها و آزمون‌های ارزیابی با کد استعلام یکتا و بارکد پاسخ‌سریع (QR)';

  const emptyTitle = currentLang === 'en'
    ? 'No Certificates Issued Yet'
    : currentLang === 'ar'
    ? 'لم تصدر أي شهادة بعد'
    : 'هنوز گواهی‌نامه‌ای برای شما صادر نشده است';

  const emptyDesc = currentLang === 'en'
    ? `Upon completing rational sciences lectures and successfully passing the scholarly examination, your official credential signed by ${getScholarName('en')} will appear here.`
    : currentLang === 'ar'
    ? `بعد إتمام المحاضرات واجتياز التقييم العلمي، ستصدر الشهادة الرسمية بتوقيع ${getScholarName('ar')} في هذا القسم.`
    : `پس از اتمام کامل درس‌گفتارهای آموزشی و قبولی در آزمون ارزیابی، گواهی رسمی ممهور به امضای ${getScholarName('fa')} در این بخش صادر خواهد شد.`;

  const verifiedLabel = currentLang === 'en'
    ? 'Verified & Authenticated'
    : currentLang === 'ar'
    ? 'معتمد وموثق رسمياً'
    : 'معتبر و تاییدشده';

  const instructorPrefix = currentLang === 'en' ? 'Instructor: ' : currentLang === 'ar' ? 'المدرس: ' : 'مدرس: ';
  const durationLabel = currentLang === 'en' ? 'Curriculum Duration:' : currentLang === 'ar' ? 'مدة الدورة:' : 'مدت دوره:';
  const scoreLabel = currentLang === 'en' ? 'Evaluation Score:' : currentLang === 'ar' ? 'التقييم النهائي:' : 'ارزیابی نهایی:';
  const issueDatePrefix = currentLang === 'en' ? 'Issued: ' : currentLang === 'ar' ? 'تاريخ الإصدار: ' : 'صدور: ';
  const verifyBtn = currentLang === 'en' ? 'Verify Credential (QR)' : currentLang === 'ar' ? 'التحقق من الأصالة (QR)' : 'استعلام اصالت (QR)';
  const printBtn = currentLang === 'en' ? 'Print' : currentLang === 'ar' ? 'طباعة' : 'چاپ';

  return (
    <div className="space-y-6 text-start font-sans">
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#8A532B]" />
            <span>{bannerTitle}</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {bannerSub}
          </p>
        </div>
      </div>

      {certs.length === 0 && (
        <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-3">
          <Award className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {emptyTitle}
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {emptyDesc}
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
                <span className="font-mono text-zinc-400 font-semibold">{toLocaleDigits(cert.id, currentLang)}</span>
                <span className="text-[#8A532B] font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{verifiedLabel}</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{cert.title}</h3>
              <p className="text-xs text-zinc-500">{instructorPrefix}{cert.instructor}</p>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5 font-mono text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>{durationLabel}</span>
                  <span className="font-bold">{cert.hours}</span>
                </div>
                <div className="flex justify-between">
                  <span>{scoreLabel}</span>
                  <span className="font-bold text-[#8A532B]">{cert.score}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap justify-between items-center gap-2">
              <span className="text-[11px] text-zinc-400 font-num">
                {issueDatePrefix}{cert.date}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={localizeHref(`/verify/${encodeURIComponent(cert.id)}`)}
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#8A532B] text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#8A532B]" />
                  <span>{verifyBtn}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{printBtn}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
