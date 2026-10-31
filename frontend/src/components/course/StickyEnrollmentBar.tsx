'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ShoppingBag, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { AudioCourse } from '@/lib/data';
import { useLanguage } from '@/context/LanguageContext';
import { triggerTactileHaptic } from '@/lib/haptics';

interface StickyEnrollmentBarProps {
  course: AudioCourse;
  title: string;
  price: string;
  isEnrolled: boolean;
  isLoading: boolean;
  onEnroll: () => void;
}

export function StickyEnrollmentBar({
  course,
  title,
  price,
  isEnrolled,
  isLoading,
  onEnroll,
}: StickyEnrollmentBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { currentLang, dict, localizeHref } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar once user scrolls past 350px
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = {
    scholar_name:
      dict.ui_hojjat_al_islam_dr_zanjirzan_hosseini,
    enroll_btn: dict.course_sticky_enroll_btn,
    enter_btn: dict.course_sticky_enter_btn,
    loading: dict.catalog_loading_more,
  };

  return (
    <aside
      aria-label="نوار ثبت‌نام دوره"
      className={`fixed bottom-0 inset-x-0 z-40 transition-[color,background-color,border-color,opacity,transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      } bg-[#FAF8F5]/95 dark:bg-[#141518]/95 backdrop-blur-md border-t border-[#E6E1D8] dark:border-[#24262D] shadow-2xl py-3`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Course Info Preview */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex w-11 h-11 rounded-xl bg-[#8A532B]/10 dark:bg-[#C58B43]/15 border border-[#8A532B]/20 dark:border-[#C58B43]/30 items-center justify-center shrink-0">
            <img
              src="/images/ostad_zanjirzan.jpg"
              alt={t.scholar_name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          </div>

          <div className="min-w-0 text-start">
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-md">
              {title}
            </h4>
            <span className="text-[11px] font-mono text-[#8A532B] dark:text-[#C58B43] block truncate">
              {t.scholar_name}
            </span>
          </div>
        </div>

        {/* Pricing & CTA Actions */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Tuition */}
          <div className="text-end">
            <span className="block text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 font-num">
              {price}
            </span>
          </div>

          {/* Action Button */}
          {isEnrolled ? (
            <Link
              href={localizeHref(`/courses/${course.id}/learn`)}
              onClick={() => triggerTactileHaptic('tick')}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724423] dark:bg-[#C58B43] dark:hover:bg-[#B37932] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.enter_btn}</span>
              {currentLang === 'en' ? (
                <ArrowRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowLeft className="w-3.5 h-3.5" />
              )}
            </Link>
          ) : (
            <button
              onClick={() => {
                triggerTactileHaptic('tick');
                onEnroll();
              }}
              disabled={isLoading}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724423] dark:bg-[#C58B43] dark:hover:bg-[#B37932] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.loading}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{t.enroll_btn}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
