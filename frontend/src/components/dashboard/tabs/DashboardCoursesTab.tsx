'use client';

import React from 'react';
import Link from 'next/link';
import {
  Play,
  Headphones,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { getScholarName } from '@/lib/constants';
import { getLocalizedSubject } from '@/lib/localization';
import { COURSE_ID_ALIASES } from '@/lib/data';

function getCanonicalCourseId(id: string): string {
  return COURSE_ID_ALIASES[id] || id;
}

function isCourseEnrolled(courseId: string, enrolledIds: string[]): boolean {
  const canonical = getCanonicalCourseId(courseId);
  return enrolledIds.some(id => getCanonicalCourseId(id) === canonical || id === courseId);
}

export function DashboardCoursesTab() {
  const { user } = useAuth();
  const { courses } = useData();
  const { toLocale, currentLang, dict, localizeHref } = useLanguage();

  const enrolledCourseIds = user?.enrolledCourseIds || [];
  const allCourses = Object.values(courses);
  const seenCanonical = new Set<string>();
  const enrolledList = allCourses.filter((c) => {
    const canonical = getCanonicalCourseId(c.id);
    if (seenCanonical.has(canonical)) return false;
    if (isCourseEnrolled(c.id, enrolledCourseIds)) {
      seenCanonical.add(canonical);
      return true;
    }
    return false;
  });

  const emptyTitle = currentLang === 'en'
    ? 'No Enrolled Courses Found'
    : currentLang === 'ar'
    ? 'لا توجد دروس مسجلة حالياً'
    : 'در حال حاضر در هیچ دوره‌ای ثبت‌نام نکرده‌اید';

  const emptyDesc = currentLang === 'en'
    ? 'Browse the rational sciences catalog to enroll and listen to audio lectures.'
    : currentLang === 'ar'
    ? 'تصفح قائمة الدروس للتسجيل والوصول إلى البث الصوتي المعتمد.'
    : 'برای گوش دادن به جلسات صوتی و مطالعه سرفصل‌ها، به کاتالوگ جامع دوره‌ها مراجعه کنید.';

  const browseLabel = currentLang === 'en'
    ? 'Explore Course Catalog'
    : currentLang === 'ar'
    ? 'تصفح قائمة الدروس'
    : 'مشاهده کاتالوگ درس‌گفتارها';

  const bannerTitle = currentLang === 'en'
    ? 'Enrolled Lectures & Courses'
    : currentLang === 'ar'
    ? 'الدورات والمحاضرات المسجلة'
    : 'درس‌گفتارهای ثبت‌نام‌شده';

  const bannerSub = currentLang === 'en'
    ? 'Direct access to verified audio lectures and scholarly seminars'
    : currentLang === 'ar'
    ? 'الوصول المباشر إلى المحاضرات الصوتية والمباحثات العلمية'
    : 'دسترسی مستقیم به جلسات صوتی و مباحثات علمی';

  return (
    <div className="space-y-6 text-start">
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {bannerTitle}
          </h2>
          <p className="text-xs text-zinc-500">
            {bannerSub}
          </p>
        </div>
      </div>

      {enrolledList.length === 0 ? (
        <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 shadow-xs text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-3">
            <Headphones className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {emptyTitle}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
            {emptyDesc}
          </p>
          <Link
            href={localizeHref('/courses')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition"
          >
            <BookOpen className="w-4 h-4" />
            <span>{browseLabel}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrolledList.map((course) => {
            const courseTitle = currentLang === 'en' && course.title_en
              ? course.title_en
              : (currentLang === 'ar' && course.title_ar ? course.title_ar : course.title_fa);

            const badgeType = course.course_type === 'online'
              ? (currentLang === 'en' ? '[ Online Workshop ]' : currentLang === 'ar' ? '[ ورشة تفاعلية ]' : '[ دوره آنلاین ]')
              : (currentLang === 'en' ? '[ Recorded Curriculum ]' : currentLang === 'ar' ? '[ دورة مسجلة ]' : '[ دوره آفلاین ]');

            const instructorLabel = currentLang === 'en'
              ? `Instructor: ${getScholarName('en')}`
              : currentLang === 'ar'
              ? `المدرس: ${getScholarName('ar')}`
              : `مدرس: ${getScholarName('fa')}`;

            const sessionCountLabel = currentLang === 'en'
              ? `${toLocale(course.chapters?.length || 12)} Audio Sessions`
              : currentLang === 'ar'
              ? `${toLocale(course.chapters?.length || 12)} جلسات صوتية`
              : `${toLocale(course.chapters?.length || 12)} جلسه صوت`;

            const syllabusBtnLabel = currentLang === 'en'
              ? 'Syllabus'
              : currentLang === 'ar'
              ? 'سير الدروس'
              : 'سرفصل‌ها';

            const playBtnLabel = currentLang === 'en'
              ? 'Play Sessions'
              : currentLang === 'ar'
              ? 'استماع للجلسات'
              : 'پخش جلسات';

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8A532B]/40 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-3 py-0.5 rounded-full bg-[#8A532B]/10 text-[#8A532B] font-mono font-medium">
                      {getLocalizedSubject(course.subject, currentLang)}
                    </span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {badgeType}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {courseTitle}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {instructorLabel}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">
                    {sessionCountLabel}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={localizeHref(`/courses/${course.id}`)}
                      className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    >
                      {syllabusBtnLabel}
                    </Link>
                    <Link
                      href={localizeHref(`/courses/${course.id}/learn`)}
                      className="px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition flex items-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ps-0.5" />
                      <span>{playBtnLabel}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
