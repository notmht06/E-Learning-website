'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

export function VibeFarsiFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: 'سیر آموزشی درس‌گفتارها از کدام سطح آغاز می‌شود و پیش‌نیاز آنها چیست؟',
      a: 'سیر آموزشی از مبادی منطق و منطق مظفر برای نوآموزان آغاز می‌شود و سپس وارد بدایة الحکمة، نهایة الحکمة و دوره‌های تخصصی اسفار اربعه و اشارات می‌شود. هر دوره پیش‌نیازهای دقیق و منابع مرجع خود را در بخش نقشه راه پایگاه به روشنی داراست.',
    },
    {
      q: 'آیا صوت جلسات امکان استفاده با مصرف بهینه اینترنت و در پس‌زمینه را دارد؟',
      a: 'بله، پلیر سامانه به صورت اختصاصی از حالت فقط صوت و بافرینگ خودکار پشتیبانی می‌کند. صوت بدون وقفه در پس‌زمینه مرورگر و گوشی همراه پخش می‌شود و دانشجویان می‌توانند همزمان به مطالعه تقریرات و یادداشت‌برداری بپردازند.',
    },
    {
      q: 'دستیار هوش مصنوعی (حکمت‌یار) بر چه اساسی پاسخ می‌دهد؟',
      a: 'پاسخ‌های حکمت‌یار منحصراً بر پایه متن تقریرات، صوت جلسات و مبانی تحلیلی تدریس‌شده توسط حجت الاسلام دکتر زنجیرزن حسینی استخراج می‌شوند و با ارجاع دقیق به دقایق جلسات و فصول کتب مرجع ارائه می‌شوند.',
    },
    {
      q: 'آیا برای طلاب و دانشجویان امکان دریافت گواهی‌نامه پایان دوره وجود دارد؟',
      a: 'پس از سپری کردن کامل جلسات هر دوره و موفقیت در آزمون یا ارزیابی علمی، گواهی‌نامه الکترونیکی دارای کد رهگیری یکتا و QR استعلام رسمی صادر می‌شود که در بخش استعلام پایگاه قابل بررسی است.',
    },
    {
      q: 'آیا دسترسی به جلسات دوره‌ها پس از ثبت‌نام منقضی می‌شود؟',
      a: 'خیر، دسترسی دانشجو به درس‌گفتارهای ثبت‌نام‌شده، صوت‌ها، جزوات PDF و تقریرات جلسات به صورت دائمی و بدون تاریخ انقضا باقی می‌ماند.',
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full py-8 text-start space-y-6">
      {/* Section Header */}
      <div className="space-y-1.5 text-center sm:text-start">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8A532B]/10 dark:bg-[#C58B43]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/20 dark:border-[#C58B43]/20">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>پرسش‌های متداول</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          پاسخ به ابهامات بنیادین دانشجویان
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          روش تحصیل، استماع صوت دروس، نحوه صدور گواهی‌نامه و امکانات آموزشی پایگاه.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-[#E6E1D8] dark:border-[#27282D] bg-white dark:bg-[#141518] overflow-hidden transition-colors shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-start cursor-pointer hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition"
              >
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#8A532B] dark:text-[#C58B43]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default VibeFarsiFAQ;
