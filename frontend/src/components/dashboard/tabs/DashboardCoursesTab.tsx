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
import { SCHOLAR_NAME } from '@/lib/constants';

function isCourseEnrolled(courseId: string, enrolledIds: string[]): boolean {
  if (enrolledIds.includes(courseId)) return true;
  if (courseId === 'course-mantiq-mabadi' && (enrolledIds.includes('course1') || enrolledIds.includes('course-mabadi-mantiq'))) return true;
  if (courseId === 'course-falsafe-bidayah' && (enrolledIds.includes('course2') || enrolledIds.includes('course-bidayat'))) return true;
  if (courseId === 'course-falsafe-asfar-1' && (enrolledIds.includes('course3') || enrolledIds.includes('course-asfar'))) return true;
  return false;
}

export function DashboardCoursesTab() {
  const { user } = useAuth();
  const { courses } = useData();
  const { toLocale, currentLang } = useLanguage();

  const enrolledCourseIds = user?.enrolledCourseIds || [];
  const allCourses = Object.values(courses);
  const enrolledList = allCourses.filter((c) => isCourseEnrolled(c.id, enrolledCourseIds));

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

  return (
    <div className="space-y-6 text-start">
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            درس‌گفتارهای ثبت‌نام‌شده
          </h2>
          <p className="text-xs text-zinc-500">
            دسترسی مستقیم به جلسات صوتی و مباحثات علمی
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
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition"
          >
            <BookOpen className="w-4 h-4" />
            <span>{browseLabel}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrolledList.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8A532B]/40 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-3 py-0.5 rounded-full bg-[#8A532B]/10 text-[#8A532B] font-mono font-medium">
                    {course.subject || 'حکمت متعالیه'}
                  </span>
                  <span className="text-zinc-400 font-mono text-[11px]">
                    {course.course_type === 'online' ? '[ دوره آنلاین ]' : '[ دوره آفلاین ]'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {currentLang === 'en' && course.title_en ? course.title_en : (currentLang === 'ar' && course.title_ar ? course.title_ar : course.title_fa)}
                </h3>
                <p className="text-xs text-zinc-500">
                  مدرس: {SCHOLAR_NAME}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">
                  {toLocale(course.chapters?.length || 12)} جلسه صوت
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/courses/${course.id}`}
                    className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    سرفصل‌ها
                  </Link>
                  <Link
                    href={`/courses/${course.id}/learn`}
                    className="px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current ps-0.5" />
                    <span>پخش جلسات</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
