'use client';

import React from 'react';
import Link from 'next/link';
import {
  Headphones,
  Radio,
  ArrowLeft,
  Compass,
  Sparkles,
  Video,
  Brain,
  Scale,
  Scroll,
  BookOpen,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';
import { CourseCategory, AudioCourse, SupportedLang } from '@/lib/data';
import { getLocalizedCategory, getLocalizedCourse } from '@/lib/localization';

interface NavbarCoursesMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'offline' | 'online';
  onTabChange: (tab: 'offline' | 'online') => void;
  categories: CourseCategory[];
  courses: Record<string, AudioCourse>;
  currentLang: SupportedLang;
  dict: Record<string, string>;
  toLocale: (val: number | string) => string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'mantiq':
      return <Brain className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />;
    case 'falsafe':
      return <Compass className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />;
    case 'fiqh':
      return <Scale className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />;
    case 'osul':
      return <Scroll className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />;
    case 'tafsir':
      return <BookOpen className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />;
    case 'kalam':
      return <ShieldCheck className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />;
    case 'erfan-nazari':
      return <Sparkles className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />;
    case 'erfan-amali':
      return <HeartHandshake className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />;
    default:
      return <Compass className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />;
  }
};

export const NavbarCoursesMegaMenu: React.FC<NavbarCoursesMegaMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  categories,
  courses,
  currentLang,
  dict,
  toLocale,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (!isOpen) return null;

  const onlineCoursesList = Object.values(courses).filter((c) => c.course_type === 'online');
  const getCategoryCourseCount = (catName: string) => {
    return Object.values(courses).filter((c) => c.subject === catName).length;
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[min(94vw,860px)] max-w-5xl z-50 transition-all duration-200 animate-in fade-in zoom-in-95 pointer-events-auto"
    >
      <div className="bg-[#FAF8F5] dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#27282D] rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/15 dark:shadow-black/70 overflow-hidden text-start">
        {/* Top Segmented Tabs: Offline vs Online Skyroom */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E6E1D8] dark:border-[#27282D]">
          <div className="flex items-center gap-2 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl border border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => onTabChange('offline')}
              className={`group/tab px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'offline'
                  ? 'bg-[#8A532B] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>{dict.nav_courses_offline || 'دوره‌های آفلاین'}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-num font-bold transition-colors ${
                  activeTab === 'offline'
                    ? 'bg-white/25 text-white'
                    : 'bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 group-hover/tab:text-[#8A532B] dark:group-hover/tab:text-[#C58B43] group-hover/tab:bg-[#8A532B]/10 dark:group-hover/tab:bg-[#C58B43]/15'
                }`}
              >
                {toLocale(Object.values(courses).filter((c) => c.course_type === 'offline').length)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('online')}
              className={`group/tab px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'online'
                  ? 'bg-[#8A532B] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{dict.nav_courses_online || 'کلاس‌های آنلاین (اسکای‌روم)'}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-num font-bold transition-colors ${
                  activeTab === 'online'
                    ? 'bg-white/25 text-white'
                    : 'bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 group-hover/tab:text-[#8A532B] dark:group-hover/tab:text-[#C58B43] group-hover/tab:bg-[#8A532B]/10 dark:group-hover/tab:bg-[#C58B43]/15'
                }`}
              >
                {toLocale(onlineCoursesList.length)}
              </span>
            </button>
          </div>

          <Link
            href="/courses"
            onClick={onClose}
            className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43] hover:underline flex items-center gap-1.5 transition-colors"
          >
            <span>{dict.nav_view_all || 'مشاهده آرشیو کامل'}</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>

        {/* Mega-Menu Body depending on Tab */}
        {activeTab === 'offline' ? (
          <div className="flex flex-col lg:flex-row gap-5 items-stretch">
            {/* Right (RTL): 8 Disciplines Grid */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="text-[11px] font-bold text-[#8A532B] dark:text-[#C58B43] uppercase tracking-wider flex items-center gap-2 mb-1">
                <Compass className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
                <span>{dict.nav_disciplines_title || 'محورهای هشت‌گانه علوم عقلی و نقلی:'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {categories.map((cat) => {
                  const locCat = getLocalizedCategory(cat, currentLang);
                  const count = getCategoryCourseCount(cat.name);
                  return (
                    <Link
                      key={cat.id}
                      href={`/courses?subject=${encodeURIComponent(cat.name)}`}
                      onClick={onClose}
                      className="group p-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-[#8A532B]/10 dark:hover:bg-[#C58B43]/15 border border-transparent hover:border-[#8A532B]/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xs flex items-center justify-between gap-2 min-w-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1E2024] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 border border-black/5 dark:border-white/5">
                          {getCategoryIcon(cat.slug)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition-colors truncate">
                            {locCat?.name || cat.name}
                          </h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[140px]">
                            {locCat?.description || cat.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full font-num shrink-0 whitespace-nowrap">
                        {toLocale(count)} {dict.courses_count_suffix || 'دوره'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Left (RTL): Curated Offline Highlight Card */}
            <div className="w-full lg:w-[270px] shrink-0 bg-white dark:bg-[#1A1C20] border border-[#E6E1D8] dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#8A532B]/50">
              <div className="space-y-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>{dict.nav_featured_offline || 'دوره شاخص آفلاین'}</span>
                </span>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {dict.nav_featured_course_title || 'دوره خارج شرح اسفار اربعه ملاصدرا (سفر اول)'}
                </h4>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {dict.nav_featured_course_desc || 'کامل‌ترین دوره درس خارج اسفار با کیفیت استودیویی، سرفصل‌بندی تحلیلی و دسترسی آزاد به فصول.'}
                </p>
              </div>

              <Link
                href="/courses/course-falsafe-asfar-1"
                onClick={onClose}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold text-center transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{dict.nav_view_lessons || 'مشاهده جلسات درس'}</span>
                <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 shrink-0" />
              </Link>
            </div>
          </div>
        ) : (
          /* Online Skyroom Tab */
          <div className="flex flex-col lg:flex-row gap-5 items-stretch">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="text-[11px] font-bold text-[#8A532B] dark:text-[#C58B43] uppercase tracking-wider flex items-center gap-2 mb-1">
                <Radio className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
                <span>{dict.nav_live_classes || 'کلاس‌های آنلاین در حال ثبت‌نام:'}</span>
              </div>

              <div className="space-y-2.5">
                {onlineCoursesList.map((oc) => {
                  const locOc = getLocalizedCourse(oc, currentLang);
                  const capacity = oc.capacity || 30;
                  const enrolled = oc.enrolledCount || 0;
                  const remaining = Math.max(0, capacity - enrolled);
                  const isFull = remaining === 0;

                  return (
                    <Link
                      key={oc.id}
                      href="/courses"
                      onClick={onClose}
                      className="group p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-[#8A532B]/10 dark:hover:bg-[#C58B43]/15 border border-transparent hover:border-[#8A532B]/30 transition block"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#8A532B] dark:text-[#C58B43] block mb-0.5">
                            {oc.subject} • {oc.schedule}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition-colors">
                            {locOc?.title || oc.title_fa}
                          </h4>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-num shrink-0 ${
                            isFull
                              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                              : 'bg-[#8A532B]/15 text-[#8A532B] dark:text-[#C58B43]'
                          }`}
                        >
                          {isFull
                            ? dict.skyroom_status_full || 'تکمیل ظرفیت'
                            : `${toLocale(remaining)} ${dict.nav_seats_left || 'صندلی خالی'}`}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Skyroom Info Banner */}
            <div className="w-full lg:w-[270px] shrink-0 bg-[#8A532B]/10 dark:bg-[#1E2024] border border-[#8A532B]/20 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <div className="space-y-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8A532B] text-white text-[10px] font-bold shadow-xs">
                  <Video className="w-3 h-3 shrink-0" />
                  <span>{dict.skyroom_badge || 'پلتفرم اسکای‌روم'}</span>
                </span>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {dict.nav_skyroom_features_title || 'امکانات وبینارها و کلاس‌های آنلاین'}
                </h4>
                <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-2 pt-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] shrink-0" />
                    <span>{dict.nav_skyroom_feat_1 || 'پرسش و پاسخ صوتی و متنی با استاد'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] shrink-0" />
                    <span>{dict.nav_skyroom_feat_2 || 'ظرفیت محدود جهت حفظ کیفیت'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] shrink-0" />
                    <span>{dict.nav_skyroom_feat_3 || 'اعطای گواهی معتبر پایان کارگاه'}</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/courses"
                onClick={onClose}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold text-center transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{dict.nav_all_online_classes || 'مشاهده همه کلاس‌های آنلاین'}</span>
                <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 shrink-0" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
