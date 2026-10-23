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
}

export const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'mantiq':
      return <Brain className="w-4 h-4 text-[#8A532B] shrink-0" />;
    case 'falsafe':
      return <Compass className="w-4 h-4 text-[#8A532B] shrink-0" />;
    case 'fiqh':
      return <Scale className="w-4 h-4 text-[#8A532B] shrink-0" />;
    case 'osul':
      return <Scroll className="w-4 h-4 text-[#8A532B] shrink-0" />;
    case 'tafsir':
      return <BookOpen className="w-4 h-4 text-[#8A532B] shrink-0" />;
    case 'kalam':
      return <ShieldCheck className="w-4 h-4 text-[#8A532B] shrink-0" />;
    case 'erfan-nazari':
      return <Sparkles className="w-4 h-4 text-[#8A532B] shrink-0" />;
    case 'erfan-amali':
      return <HeartHandshake className="w-4 h-4 text-[#8A532B] shrink-0" />;
    default:
      return <Compass className="w-4 h-4 text-book-accent shrink-0" />;
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
}) => {
  if (!isOpen) return null;

  const onlineCoursesList = Object.values(courses).filter((c) => c.course_type === 'online');
  const getCategoryCourseCount = (catName: string) => {
    return Object.values(courses).filter((c) => c.subject === catName).length;
  };

  return (
    <div className="absolute top-full start-1/2 -translate-x-1/2 rtl:translate-x-1/2 pt-3 w-[min(92vw,780px)] max-w-[calc(100vw-2rem)] transition duration-200 animate-in fade-in zoom-in-95">
      <div className="bg-white/95 dark:bg-[#18191D]/95 backdrop-blur-2xl border border-book-border dark:border-stone-800 rounded-3xl p-5 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden text-start">
        {/* Top Segmented Tabs: Offline vs Online Skyroom */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-book-border dark:border-stone-800">
          <div className="flex items-center gap-2 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl border border-black/5 dark:border-white/5">
            <button
              onClick={() => onTabChange('offline')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'offline'
                  ? 'bg-book-accent text-white shadow-md shadow-book-accent/20'
                  : 'text-book-subtext hover:text-book-text dark:hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>{dict.nav_courses_offline || 'دوره‌های آفلاین'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-num">
                {toLocale(Object.values(courses).filter((c) => c.course_type === 'offline').length)}
              </span>
            </button>

            <button
              onClick={() => onTabChange('online')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'online'
                  ? 'bg-[#8A532B] text-white shadow-md shadow-black/10'
                  : 'text-book-subtext hover:text-book-text dark:hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-[#8A532B]" />
              <span>{dict.nav_courses_online || 'کلاس‌های آنلاین (اسکای‌روم)'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8A532B]/30 font-num">
                {toLocale(onlineCoursesList.length)}
              </span>
            </button>
          </div>

          <Link
            href="/courses"
            onClick={onClose}
            className="text-xs font-bold text-book-accent hover:underline flex items-center gap-1"
          >
            <span>{dict.nav_view_all || 'مشاهده آرشیو کامل'}</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>

        {/* Mega-Menu Body depending on Tab */}
        {activeTab === 'offline' ? (
          <div className="grid grid-cols-12 gap-5">
            {/* Left: 8 Disciplines Grid (8 cols) */}
            <div className="col-span-8 space-y-3">
              <div className="text-[11px] font-bold text-book-subtext uppercase tracking-wider flex items-center gap-2 mb-2">
                <Compass className="w-3.5 h-3.5 text-book-accent" />
                <span>{dict.nav_disciplines_title || 'محورهای هشت‌گانه علوم عقلی و نقلی:'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const locCat = getLocalizedCategory(cat, currentLang);
                  const count = getCategoryCourseCount(cat.name);
                  return (
                    <Link
                      key={cat.id}
                      href={`/courses?subject=${encodeURIComponent(cat.name)}`}
                      onClick={onClose}
                      className="group p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-[#8A532B]/10 dark:hover:bg-[#C58B43]/15 border border-transparent hover:border-[#8A532B]/30 transition flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 shadow-xs flex items-center justify-center group-hover:scale-110 transition">
                          {getCategoryIcon(cat.slug)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-book-text dark:text-stone-100 group-hover:text-book-accent transition">
                            {locCat?.name || cat.name}
                          </h4>
                          <p className="text-[10px] text-book-subtext line-clamp-1 max-w-[150px]">
                            {locCat?.description || cat.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-book-subtext dark:text-stone-400 bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-full font-num shrink-0">
                        {toLocale(count)} {dict.courses_count_suffix || 'دوره'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Curated Offline Highlight (4 cols) */}
            <div className="col-span-4 bg-stone-50/80 dark:bg-[#141518] border border-stone-200/90 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-book-accent/10 text-book-accent dark:text-[#C58B43] text-[10px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>{dict.nav_featured_offline || 'دوره شاخص آفلاین'}</span>
                </span>
                <h4 className="text-xs font-bold text-book-text dark:text-white leading-snug">
                  {dict.nav_featured_course_title || 'دوره خارج شرح اسفار اربعه ملاصدرا (سفر اول)'}
                </h4>
                <p className="text-[11px] text-book-subtext dark:text-stone-300 leading-relaxed line-clamp-3">
                  {dict.nav_featured_course_desc || 'کامل‌ترین دوره درس خارج اسفار با کیفیت استودیویی، سرفصل‌بندی تحلیلی و دسترسی آزاد به فصول.'}
                </p>
              </div>

              <Link
                href="/courses/course-falsafe-asfar-1"
                onClick={onClose}
                className="mt-3 w-full py-2 rounded-xl bg-book-accent hover:bg-book-accentHover text-white text-xs font-bold text-center transition shadow-md flex items-center justify-center gap-2"
              >
                <span>{dict.nav_view_lessons || 'مشاهده جلسات درس'}</span>
                <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
              </Link>
            </div>
          </div>
        ) : (
          /* Online Skyroom Tab */
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-7 space-y-3">
              <div className="text-[11px] font-bold text-book-subtext uppercase tracking-wider flex items-center gap-2 mb-2">
                <Radio className="w-3.5 h-3.5 text-[#8A532B]" />
                <span>{dict.nav_live_classes || 'کلاس‌های آنلاین در حال ثبت‌نام:'}</span>
              </div>

              <div className="space-y-3">
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
                      className="group p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-[#8A532B]/10 dark:hover:bg-[#C58B43]/15 border border-black/5 dark:border-white/5 hover:border-[#8A532B]/30 transition block"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#8A532B] dark:text-[#C58B43] block mb-0.5">
                            {oc.subject} • {oc.schedule}
                          </span>
                          <h4 className="text-xs font-bold text-book-text dark:text-stone-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition">
                            {locOc?.title || oc.title_fa}
                          </h4>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-num shrink-0 ${
                            isFull
                              ? 'bg-[#8A532B]/10 text-[#8A532B]'
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

            {/* Right: Skyroom Info Banner */}
            <div className="col-span-5 bg-[#8A532B]/15 dark:bg-[#C58B43]/40 dark:border border-[#8A532B]/30 dark:border-[#C58B43]/30 rounded-2xl p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#8A532B] text-white text-[10px] font-bold shadow-xs">
                  <Video className="w-3 h-3" />
                  <span>{dict.skyroom_badge || 'پلتفرم اسکای‌روم (Skyroom)'}</span>
                </span>
                <h4 className="text-xs font-bold text-book-text dark:text-white leading-snug">
                  {dict.nav_skyroom_features_title || 'امکانات وبینارها و کلاس‌های آنلاین'}
                </h4>
                <ul className="text-[11px] text-book-subtext dark:text-stone-300 space-y-2 pt-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] shrink-0" />
                    <span>{dict.nav_skyroom_feat_1 || 'پرسش و پاسخ صوتی و متنی مستقیم با استاد'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8A532B] shrink-0" />
                    <span>{dict.nav_skyroom_feat_2 || 'ظرفیت محدود جهت حفظ کیفیت مباحثه علمی'}</span>
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
                className="mt-4 w-full py-2 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold text-center transition shadow-md shadow-black/10 flex items-center justify-center gap-2"
              >
                <span>{dict.nav_all_online_classes || 'مشاهده همه کلاس‌های آنلاین'}</span>
                <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
