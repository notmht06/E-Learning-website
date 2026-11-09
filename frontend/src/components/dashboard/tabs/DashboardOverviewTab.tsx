'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Headphones,
  TrendingUp,
  BookMarked,
  Award,
  Play,
  Sparkles,
  GraduationCap,
  Clock,
  Radio,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { KpiMetricStrip, KpiMetricItem } from '@/components/dashboard/shared/KpiMetricStrip';
import { MinimalistBarChart } from '@/components/dashboard/shared/MinimalistBarChart';
import { OngoingCoursesTable, OngoingCourseItem } from '@/components/dashboard/OngoingCoursesTable';
import { OnlineClassesCalendarCard } from '@/components/dashboard/OnlineClassesCalendarCard';
import { overviewText, getChartDataByRange } from './DashboardOverviewConfig';
import { SCHOLAR_NAME } from '@/lib/constants';
import { toPersianDigits } from '@/lib/jalali';

function isCourseEnrolled(courseId: string, enrolledIds: string[]): boolean {
  if (enrolledIds.includes(courseId)) return true;
  if (courseId === 'course-mantiq-mabadi' && (enrolledIds.includes('course1') || enrolledIds.includes('course-mabadi-mantiq'))) return true;
  if (courseId === 'course-falsafe-bidayah' && (enrolledIds.includes('course2') || enrolledIds.includes('course-bidayat'))) return true;
  if (courseId === 'course-falsafe-asfar-1' && (enrolledIds.includes('course3') || enrolledIds.includes('course-asfar'))) return true;
  return false;
}

export function DashboardOverviewTab() {
  const { user } = useAuth();
  const { courses, orders } = useData();
  const { dict, currentLang, toLocale, t, localizeHref } = useLanguage();
  const langKey = (currentLang === 'ar' || currentLang === 'en') ? currentLang : 'fa';
  const text = overviewText[langKey];

  const [activeRange, setActiveRange] = useState<string>('7days');

  const enrolledCourseIds = user?.enrolledCourseIds || [];
  const allCourses = Object.values(courses);
  const enrolledCourses = allCourses.filter((c) => isCourseEnrolled(c.id, enrolledCourseIds));
  const firstCourse = enrolledCourses[0] || null;

  // 1. KPI Metric Strip Items
  const metrics: KpiMetricItem[] = [
    {
      id: 'active_courses',
      serial: '[ ۰۱ ]',
      title: t('kpi_active_courses', text.kpi_courses_title),
      value: `${toLocale(enrolledCourses.length)} ${currentLang === 'en' ? 'Courses' : 'دوره'}`,
      sublabel: text.kpi_courses_sub,
      icon: Headphones,
      colorClass: 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/40 dark:text-[#C58B43]',
    },
    {
      id: 'study_progress',
      serial: '[ ۰۲ ]',
      title: t('kpi_study_progress', text.kpi_progress_title),
      value: `${toLocale(45)}٪`,
      sublabel: text.kpi_progress_sub,
      icon: TrendingUp,
      colorClass: 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/40 dark:text-[#C58B43]',
    },
    {
      id: 'notes_count',
      serial: '[ ۰۳ ]',
      title: t('kpi_notes_count', text.kpi_notes_title),
      value: `${toLocale(2)} ${currentLang === 'en' ? 'Notes' : 'یادداشت'}`,
      sublabel: text.kpi_notes_sub,
      icon: BookMarked,
      colorClass: 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/40 dark:text-[#C58B43]',
    },
    {
      id: 'orders_count',
      serial: '[ ۰۴ ]',
      title: t('kpi_orders_count', text.kpi_orders_title),
      value: `${toLocale(orders.length)} ${currentLang === 'en' ? 'Invoices' : 'فاکتور'}`,
      sublabel: text.kpi_orders_sub,
      icon: Award,
      colorClass: 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/15 dark:text-[#C58B43]',
    },
  ];

  // 2. Chart Dataset & Ranges
  const chartDataByRange = getChartDataByRange(text.unit_hours, currentLang === 'en');
  const timeRanges = [
    { id: 'today', label: t('chart_today', text.range_today) },
    { id: '7days', label: t('chart_7days', text.range_7days) },
    { id: '30days', label: t('chart_30days', text.range_30days) },
  ];

  // 3. Ongoing Courses Mapped from Real Enrolled Courses
  const ongoingCourses: OngoingCourseItem[] = enrolledCourses.map((c, idx) => {
    const chaptersCount = c.chapters?.length || 12;
    const completed = Math.min(idx === 0 ? 4 : 2, chaptersCount);
    const progress = Math.round((completed / chaptersCount) * 100);

    const title = currentLang === 'en' && c.title_en ? c.title_en : (currentLang === 'ar' && c.title_ar ? c.title_ar : c.title_fa);
    const subject = dict.ui_rational_sciences;
    const chapterObj = c.chapters?.[completed - 1];
    const currentChapter: string =
      (currentLang === 'en' ? chapterObj?.title_en : currentLang === 'ar' ? chapterObj?.title_ar : chapterObj?.title_fa) ||
      chapterObj?.title_fa ||
      (currentLang === 'en'
        ? `Session ${completed}: Principles`
        : currentLang === 'ar'
        ? `الجلسة ٠${completed}: المبادئ`
        : `جلسه ۰${completed}: مبادی`);

    return {
      id: c.id,
      title,
      subject,
      instructor: SCHOLAR_NAME,
      currentChapterTitle: currentChapter,
      completedChapters: completed,
      totalChapters: chaptersCount,
      progressPercent: progress,
      courseType: (c.course_type as 'offline' | 'online') || 'offline',
    };
  });

  const studentName = user?.name || user?.full_name || 'دانشجوی گرامی';

  return (
    <div className="space-y-6 text-start">
      {/* 1. Academic Personalized Welcome Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/20 dark:text-[#C58B43]">
                میز کار پژوهشی دانشجو
              </span>
              <span className="text-xs text-zinc-400">•</span>
              <span className="text-xs text-zinc-500 font-num">
                {toPersianDigits(enrolledCourses.length)} دوره فعال
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
              سلام، {studentName}؛ به پیشخوان درسی خوش آمدید
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl">
              سلسله مباحث و دروس خارج حکمت، کلام و علوم عقلی تحت اشراف علمی {SCHOLAR_NAME}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={localizeHref('/courses')}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-[#8A532B] hover:text-[#8A532B] transition active:scale-95 cursor-pointer shadow-xs"
            >
              کاتالوگ دوره‌ها
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Hero Quick-Resume Player Card */}
      {firstCourse && (
        <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8A532B] dark:bg-[#C58B43]" />
              <span className="text-[11px] font-mono text-[#8A532B] dark:text-[#C58B43] font-bold block">
                {text.continue_session}
              </span>
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {currentLang === 'en' && firstCourse.title_en
                ? firstCourse.title_en
                : currentLang === 'ar' && firstCourse.title_ar
                ? firstCourse.title_ar
                : firstCourse.title_fa}
            </h2>
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{text.scholar_line}</span>
              <span>•</span>
              <span className="font-num">پیشرفت کلی: ۴۵٪</span>
            </div>
            {/* Visual mini progress track */}
            <div className="w-full max-w-md h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div className="h-full bg-[#8A532B] dark:bg-[#C58B43] rounded-full" style={{ width: '45%' }} />
            </div>
          </div>

          <Link
            href={localizeHref(`/courses/${firstCourse.id}/learn`)}
            className="px-5 py-3 rounded-2xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current translate-x-0.5" />
            <span>{text.resume_btn}</span>
          </Link>
        </div>
      )}

      {/* 3. Online Classes Calendar & Upcoming Live Sessions */}
      <OnlineClassesCalendarCard enrolledCourses={enrolledCourses} />

      {/* 4. KPI Metric Strip */}
      <KpiMetricStrip metrics={metrics} />

      {/* 5. Minimalist Weekly Study Activity Chart */}
      <MinimalistBarChart
        title={t('chart_study_activity', text.chart_title)}
        subtitle={text.chart_sub}
        data={chartDataByRange[activeRange] || chartDataByRange['7days']}
        timeRanges={timeRanges}
        activeTimeRange={activeRange}
        onTimeRangeChange={setActiveRange}
        metricUnit={text.unit_hours}
      />

      {/* 6. Ongoing Courses Table & Lesson Stepper */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            فهرست دوره‌های ثبت‌نام‌شده و سیر پیشرفت
          </h3>
          <span className="text-xs font-num text-zinc-500">
            {toPersianDigits(ongoingCourses.length)} دوره در حال مطالعه
          </span>
        </div>
        <OngoingCoursesTable courses={ongoingCourses} />
      </div>
    </div>
  );
}
