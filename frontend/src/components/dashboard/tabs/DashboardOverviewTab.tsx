'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Headphones,
  BookOpen,
  BookMarked,
  Award,
  Play,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { KpiMetricStrip, KpiMetricItem } from '@/components/dashboard/shared/KpiMetricStrip';
import { MinimalistBarChart } from '@/components/dashboard/shared/MinimalistBarChart';
import { OngoingCoursesTable, OngoingCourseItem } from '@/components/dashboard/OngoingCoursesTable';
import { overviewText, getChartDataByRange } from './DashboardOverviewConfig';
import { SCHOLAR_NAME } from '@/lib/constants';

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
  const { currentLang, toLocale, t } = useLanguage();
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
      id: 'books_read',
      serial: '[ ۰۲ ]',
      title: t('kpi_books_read', text.kpi_books_title),
      value: `${toLocale(user?.purchasedBookIds?.length || 0)} ${currentLang === 'en' ? 'Book' : 'کتاب'}`,
      sublabel: text.kpi_books_sub,
      icon: BookOpen,
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
      value: `${toLocale(orders.length)} ${currentLang === 'en' ? 'Shipments' : 'مرسوله'}`,
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
    const subject = currentLang === 'en' ? 'Rational Sciences' : currentLang === 'ar' ? 'العلوم العقلية' : 'علوم عقلی';
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

  return (
    <div className="space-y-6 text-start">
      <KpiMetricStrip metrics={metrics} />

      {firstCourse && (
        <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#8A532B] dark:text-[#C58B43] block">
              {text.continue_session}
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              {currentLang === 'en' && firstCourse.title_en
                ? firstCourse.title_en
                : currentLang === 'ar' && firstCourse.title_ar
                ? firstCourse.title_ar
                : firstCourse.title_fa}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {text.scholar_line}
            </p>
          </div>

          <Link
            href={`/courses/${firstCourse.id}/learn`}
            className="px-5 py-3 rounded-full bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-current ps-0.5" />
            <span>{text.resume_btn}</span>
          </Link>
        </div>
      )}

      <MinimalistBarChart
        title={t('chart_study_activity', text.chart_title)}
        subtitle={text.chart_sub}
        data={chartDataByRange[activeRange] || chartDataByRange['7days']}
        timeRanges={timeRanges}
        activeTimeRange={activeRange}
        onTimeRangeChange={setActiveRange}
        metricUnit={text.unit_hours}
      />

      <OngoingCoursesTable courses={ongoingCourses} />
    </div>
  );
}
