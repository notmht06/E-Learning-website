'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Radio } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { coursesDatabase } from '@/lib/data';
import { AudioVideoPlayerEngine } from '@/components/learn/AudioVideoPlayerEngine';
import { CoursePlaylistSidebar } from '@/components/course/CoursePlaylistSidebar';
import { LessonWorkspaceTabs } from '@/components/learn/LessonWorkspaceTabs';
import { apiClient } from '@/services/apiClient';
import { SCHOLAR_NAME, getScholarName } from '@/lib/constants';
import { getLocalizedChapterTitle, getLocalizedSubject } from '@/lib/localization';

export default function CourseLearnTheaterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id || 'course-mantiq-mabadi';
  const { courses } = useData();
  const { dict, currentLang, localizeHref } = useLanguage();
  const { user } = useAuth();

  const course =
    courses[courseId] ||
    coursesDatabase[courseId] ||
    courses['course-mantiq-mabadi'] ||
    Object.values(coursesDatabase)[0];

  const isEnrolled =
    !!user && (user.role === 'ADMIN' || user.enrolledCourseIds.includes(course.id));

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [chapterPositions, setChapterPositions] = useState<Record<number, number>>({});

  // Hydrate saved progress from backend database on mount
  useEffect(() => {
    let mounted = true;
    if (!user) return;
    apiClient.courses
      .getProgress(course.id)
      .then((res) => {
        if (!mounted || !res) return;
        if (Array.isArray(res.completed_chapter_ids)) {
          setCompletedChapters(res.completed_chapter_ids);
        }
        if (Array.isArray(res.items)) {
          const posMap: Record<number, number> = {};
          res.items.forEach((item) => {
            posMap[item.chapter_id] = item.last_pos_sec || 0;
          });
          setChapterPositions(posMap);
        }
      })
      .catch((err) => { console.warn('Failed to load course progress:', err); });

    return () => {
      mounted = false;
    };
  }, [user, course.id]);

  const activeChapter = course.chapters?.[activeChapterIndex] ||
    course.chapters?.[0] || {
      id: 1,
      title_fa: 'جلسه نخست: تمهید و مدخل',
      duration: '۴۵:۰۰',
      audioUrl: '/audio/sample_lecture.wav',
    };

  const courseTitle =
    currentLang === 'ar'
      ? course.title_ar || course.title_fa
      : currentLang === 'en'
      ? course.title_en || course.title_fa
      : course.title_fa;

  const chapterTitle = getLocalizedChapterTitle(activeChapter, currentLang);
  const locPrice =
    currentLang === 'ar'
      ? course.price_ar || course.price_fa
      : currentLang === 'en'
      ? course.price_en || course.price_fa
      : course.price_fa;
  const isFree = course.price_fa?.includes('رایگان') || course.price_fa === '0';
  const isChapterPreview = !!activeChapter.isFreePreview || activeChapterIndex === 0;
  const isChapterLocked = !isEnrolled && !isChapterPreview;
  const isChapterCompleted = completedChapters.includes(activeChapter.id);

  const handleToggleChapterComplete = () => {
    const chId = activeChapter.id;
    setCompletedChapters((prev) => {
      const isCurrentlyDone = prev.includes(chId);
      const updated = isCurrentlyDone
        ? prev.filter((id) => id !== chId)
        : [...prev, chId];

      if (user) {
        apiClient.courses
          .syncProgress(course.id, chId, isCurrentlyDone ? 0 : 100, isCurrentlyDone ? 0 : 2700)
          .catch((err) => console.warn('Failed to sync chapter completion toggle:', err));
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0D0E] text-[#0C0D0E] dark:text-[#FAF8F5] transition-colors pb-8">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full text-start">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1D8] dark:border-[#22242A] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Link href={localizeHref('/courses')} className="hover:text-zinc-700 dark:hover:text-zinc-200">
                {dict.learn_breadcrumb_courses || dict.nav_lectures || 'درس‌گفتارها'}
              </Link>
              <span>/</span>
              <span className="text-[#8A532B] dark:text-[#C58B43]">
                {getLocalizedSubject(course.subject, currentLang)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
              {courseTitle}
            </h1>
            <p className="text-xs text-zinc-500">
              {dict.learn_instructor_prefix || dict.course_instructor_label || 'مدرس:'}{' '}
              {dict.scholar_name || getScholarName(currentLang)}
            </p>
          </div>

          <Link
            href={localizeHref(`/courses/${course.id}`)}
            className="px-4 py-2 rounded-xl border border-[#E6E1D8] dark:border-[#22242A] text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-[#8A532B] transition flex items-center gap-2 self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
            <span>{dict.learn_view_course_intro || 'مشاهده صفحه معرفی دوره'}</span>
          </Link>
        </div>

        {/* 2-Column Grid: Player + Playlist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Media & Interaction Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {course.course_type === 'online' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8A532B]" />
                      <span className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43]">
                        {currentLang === 'en'
                          ? 'Live Online Session Gateway'
                          : currentLang === 'ar'
                          ? 'بوابة الدرس المباشر (أونلاين)'
                          : 'درگاه ورود به جلسه آنلاین زنده'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      {course.schedule
                        ? `زمان برگزاری: ${course.schedule}`
                        : 'طبق تقویم آموزشی هفتگی'}
                    </p>
                  </div>

                  {course.skyroomUrl ? (
                    <a
                      href={course.skyroomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-[#FAF8F5] font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                      <Radio className="w-4 h-4 text-[#E6CA85]" />
                      <span>
                        {currentLang === 'en'
                          ? 'Join Live Skyroom Class'
                          : currentLang === 'ar'
                          ? 'دخول غرفة البث المباشر'
                          : 'ورود به کلاس آنلاین در اسکایروم'}
                      </span>
                    </a>
                  ) : null}
                </div>
              </div>
            )}

            <AudioVideoPlayerEngine
              courseId={course.id}
              chapterId={activeChapter.id}
              courseTitle={courseTitle}
              chapterTitle={chapterTitle}
              instructorName={dict.scholar_name || SCHOLAR_NAME}
              audioUrl={activeChapter.audioUrl || course.sampleAudioUrl}
              videoUrl={activeChapter.videoUrl}
              initialPositionSec={chapterPositions[activeChapter.id] || 0}
              isLocked={isChapterLocked}
              isCompleted={isChapterCompleted}
              price={locPrice}
              isFree={isFree}
              onToggleComplete={handleToggleChapterComplete}
              onProgressSync={(chId, pct, sec) => {
                setChapterPositions((prev) => ({ ...prev, [chId]: sec }));
                if (pct >= 90 && !completedChapters.includes(chId)) {
                  setCompletedChapters((prev) => [...prev, chId]);
                }
              }}
              onChapterComplete={() => {
                if (!completedChapters.includes(activeChapter.id)) {
                  setCompletedChapters((prev) => [...prev, activeChapter.id]);
                }
              }}
            />

            {/* Stage 9: Sabzlearn-Inspired Learning Workspace Tabs & AI Assistant */}
            <LessonWorkspaceTabs
              courseId={course.id}
              chapterId={activeChapter.id}
              courseTitle={courseTitle}
              chapterTitle={chapterTitle}
            />
          </div>

          {/* Sidebar Playlist Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-4 sticky top-6">
            <CoursePlaylistSidebar
              courseId={course.id}
              chapters={course.chapters}
              activeChapterId={activeChapter.id}
              isEnrolled={isEnrolled}
              onSelectChapter={(idx) => setActiveChapterIndex(idx)}
              completedChapterIds={completedChapters}
            />

            {/* Scholar Office Notice */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] text-xs space-y-2 text-start">
              <div className="flex items-center gap-2 text-[#8A532B] dark:text-[#C58B43]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold">
                  {dict.learn_drm_title || 'استفاده قانونی با رعایت حقوق مؤلف'}
                </span>
              </div>
              <p className="text-zinc-500 leading-relaxed text-[11px]">
                {dict.learn_drm_desc ||
                  'تمامی فایل‌های صوتی منحصراً برای استفاده شخصی دانش‌پژوه ثبت‌نام‌شده است. هرگونه تکثیر یا اشتراک‌گذاری بدون اجازه مؤلف فاقد رضایت شرعی است.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
