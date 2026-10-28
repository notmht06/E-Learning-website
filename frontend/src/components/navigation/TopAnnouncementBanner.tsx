'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function TopAnnouncementBanner() {
  const { currentLang, isRtl } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = sessionStorage.getItem('zan_dismissed_top_announcement');
      if (!isDismissed) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('zan_dismissed_top_announcement', 'true');
    }
  };

  if (!isVisible) return null;

  const content = {
    fa: {
      badge: 'اطلاعیه رسمی کرسی درس خارج',
      message: 'آغاز ثبت‌نام ترم جدید درس خارج اسفار اربعه و مبانی حکمت صدرایی (سال تحصیلی ۱۴۰۵-۱۴۰۶)',
      action: 'مشاهده سرفصل‌ها و نمونه صوت',
    },
    ar: {
      badge: 'إعلان كرسي البحث الخارج',
      message: 'بدء التسجيل للفصل الجديد في مباحث الحكمة المتعالية وشرح الأسفار الأربعة',
      action: 'الاطلاع على المنهج والدروس النموذجية',
    },
    en: {
      badge: 'Official Seminary Announcement',
      message: 'Registration Open: Advanced Course in Transcendent Wisdom & Asfar al-Arba\'ah (Academic Year 2026-2027)',
      action: 'View Syllabus & Sample Audio',
    },
  }[currentLang] || {
    badge: 'اطلاعیه رسمی کرسی درس خارج',
    message: 'آغاز ثبت‌نام ترم جدید درس خارج اسفار اربعه و مبانی حکمت صدرایی',
    action: 'مشاهده سرفصل‌ها و نمونه صوت',
  };

  return (
    <aside
      aria-label="Top Announcement"
      className="relative z-50 bg-[#16120F] dark:bg-[#0A0B0C] border-b border-[#8A532B]/35 text-[#FAF8F5] py-2 px-3 sm:px-6 transition-all duration-300"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Left Side: Badge + Announcement Text */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8A532B]/25 text-[#E6CA85] border border-[#8A532B]/40 text-[10px] font-bold shrink-0">
            <Sparkles className="w-3 h-3 text-[#C58B43]" />
            <span>{content.badge}</span>
          </span>

          <p className="truncate text-zinc-200 text-[11px] sm:text-xs">
            {content.message}
          </p>
        </div>

        {/* Right Side: Action Link + Close Button */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href="/courses/course-falsafe-asfar-1"
            className="inline-flex items-center gap-1 font-bold text-[#E6CA85] hover:text-white transition-colors text-[11px] sm:text-xs"
          >
            <span>{content.action}</span>
            <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-0' : 'rotate-180'}`} />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
