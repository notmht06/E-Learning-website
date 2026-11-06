'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Radio,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  PERSIAN_WEEKDAY_SHORT,
  toPersianDigits,
  gregorianToJalali,
  generateJalaliMonthGrid,
} from '@/lib/jalali';
import { SCHOLAR_NAME } from '@/lib/constants';

export interface OnlineClassSession {
  id: string;
  courseId: string;
  courseTitle: string;
  sessionTopic: string;
  schedule: string;
  dayOfWeekIndex: number; // 0 = شنبه, ..., 6 = جمعه
  dayOfWeekName: string;
  timeStr: string;
  skyroomUrl?: string;
  isToday?: boolean;
}

interface OnlineClassesCalendarCardProps {
  enrolledCourses: Array<{
    id: string;
    title_fa: string;
    schedule?: string;
    skyroom_url?: string;
    skyroomUrl?: string;
    course_type?: string;
  }>;
}

export function OnlineClassesCalendarCard({ enrolledCourses }: OnlineClassesCalendarCardProps) {
  const { dict, toLocale } = useLanguage();
  const todayInfo = gregorianToJalali(new Date());

  const [activeYear, setActiveYear] = useState<number>(todayInfo.year);
  const [activeMonth, setActiveMonth] = useState<number>(todayInfo.month);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(todayInfo.day);
  const [isEnteringLive, setIsEnteringLive] = useState<string | null>(null);

  const monthGrid = generateJalaliMonthGrid(activeYear, activeMonth);

  // Map enrolled online courses into structured upcoming sessions
  const onlineCourses = enrolledCourses.filter(
    (c) => c.course_type === 'online' || Boolean(c.schedule)
  );

  const sessions: OnlineClassSession[] = onlineCourses.map((c, idx) => {
    const sched = c.schedule || 'دوشنبه‌ها ساعت ۱۸:۰۰';
    let dayIdx = 2; // Default Monday (دوشنبه)
    let dayName = 'دوشنبه';

    if (sched.includes('شنبه')) {
      if (sched.includes('یکشنبه')) {
        dayIdx = 1;
        dayName = 'یکشنبه';
      } else if (sched.includes('دوشنبه')) {
        dayIdx = 2;
        dayName = 'دوشنبه';
      } else if (sched.includes('سه‌شنبه')) {
        dayIdx = 3;
        dayName = 'سه‌شنبه';
      } else if (sched.includes('چهارشنبه')) {
        dayIdx = 4;
        dayName = 'چهارشنبه';
      } else if (sched.includes('پنجشنبه')) {
        dayIdx = 5;
        dayName = 'پنجشنبه';
      } else {
        dayIdx = 0;
        dayName = 'شنبه';
      }
    } else if (sched.includes('جمعه')) {
      dayIdx = 6;
      dayName = 'جمعه';
    }

    const isToday = todayInfo.dayOfWeekIndex === dayIdx;

    return {
      id: `session-${c.id}`,
      courseId: c.id,
      courseTitle: c.title_fa,
      sessionTopic: idx === 0 ? 'تبیین برهان امکان و وجوب و قاعده الواحد' : 'سلسله مباحث معرفت‌شناسی و نهایة الحکمة',
      schedule: sched,
      dayOfWeekIndex: dayIdx,
      dayOfWeekName: dayName,
      timeStr: sched.match(/\d+:\d+/)?.[0] ? toPersianDigits(sched.match(/\d+:\d+/)![0]) : '۱۸:۰۰',
      skyroomUrl: c.skyroom_url || c.skyroomUrl || 'https://www.skyroom.online/ch/zanjirzan/live',
      isToday,
    };
  });

  const handleEnterSkyroom = async (courseId: string, fallbackUrl?: string) => {
    setIsEnteringLive(courseId);
    try {
      const { apiClient } = await import('@/services/apiClient');
      const ticket = await apiClient.courses.getLiveAccess(courseId);
      if (ticket?.skyroom_url) {
        window.open(ticket.skyroom_url, '_blank', 'noopener,noreferrer');
        return;
      }
    } catch (err) {
      console.debug('Falling back to static live room:', err);
    } finally {
      setIsEnteringLive(null);
    }
    if (fallbackUrl) {
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const prevMonth = () => {
    if (activeMonth === 1) {
      setActiveMonth(12);
      setActiveYear((y) => y - 1);
    } else {
      setActiveMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (activeMonth === 12) {
      setActiveMonth(1);
      setActiveYear((y) => y + 1);
    } else {
      setActiveMonth((m) => m + 1);
    }
  };

  // Find sessions matching selected day or all sessions
  const activeDayOfWeek = (monthGrid.days.find((d) => d?.dayNumber === selectedDayNumber)?.dayOfWeekIndex) ?? todayInfo.dayOfWeekIndex;
  const filteredSessions = sessions.filter((s) => s.dayOfWeekIndex === activeDayOfWeek);
  const displaySessions = filteredSessions.length > 0 ? filteredSessions : sessions;

  return (
    <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6 text-start">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-[#8A532B] dark:text-[#C58B43]">
              کلاس‌های برخط اسکای‌روم و تقویم آموزشی
            </span>
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            برنامه زمانی نشست‌های زنده و جلسات پیش‌رو
          </h3>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <span className="text-xs font-num text-zinc-500 dark:text-zinc-400">
            {monthGrid.monthName} {toPersianDigits(activeYear)}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="ماه بعد"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="ماه قبل"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side (5 cols): Interactive Jalali Calendar */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 pb-1">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-[#8A532B]" />
              <span>تقویم شمسی ماه</span>
            </span>
            <span className="text-[11px] font-num text-zinc-500">
              امروز: {toPersianDigits(todayInfo.day)} {todayInfo.monthName}
            </span>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-zinc-400 pb-1 border-b border-zinc-200/50 dark:border-zinc-800">
            {PERSIAN_WEEKDAY_SHORT.map((wd) => (
              <span key={wd}>{wd}</span>
            ))}
          </div>

          {/* Month day matrix */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {monthGrid.days.map((d, idx) => {
              if (!d) {
                return <div key={`empty-${idx}`} className="h-8" />;
              }

              const isSelected = selectedDayNumber === d.dayNumber;
              const hasSessionOnThisWeekday = sessions.some((s) => s.dayOfWeekIndex === d.dayOfWeekIndex);

              return (
                <button
                  key={d.jalaliStr}
                  type="button"
                  onClick={() => setSelectedDayNumber(d.dayNumber)}
                  className={`h-8 rounded-xl font-num text-xs transition cursor-pointer flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-[#8A532B] text-white font-bold shadow-xs'
                      : d.isToday
                      ? 'border border-[#8A532B] text-[#8A532B] font-bold bg-white dark:bg-zinc-900'
                      : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span>{toPersianDigits(d.dayNumber)}</span>
                  {hasSessionOnThisWeekday && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-amber-200' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>روز دارای کلاس زنده</span>
            </span>
            <span>کلیک روی هر روز برای مشاهده جزئیات</span>
          </div>
        </div>

        {/* Right Side (7 cols): Upcoming Live Sessions List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              نشست‌های برنامه‌ریزی‌شده
            </span>
            <span className="text-[11px] font-num text-zinc-500">
              {toPersianDigits(displaySessions.length)} جلسه فعال
            </span>
          </div>

          {displaySessions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                در این تاریخ کلاسی زمان‌بندی نشده است. می‌توانید سایر روزها را انتخاب فرمایید.
              </p>
            </div>
          ) : (
            displaySessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-2xl border transition-all ${
                  session.isToday
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-[#8A532B]/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {session.isToday ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          جلسه امروز
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-[#8A532B]/15 text-[#8A532B] dark:text-[#C58B43] font-medium text-[10px]">
                          نشست آتی
                        </span>
                      )}
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {session.courseTitle}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium line-clamp-1">
                      موضوع: {session.sessionTopic}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-num">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#8A532B]" />
                        <span>{session.schedule}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{SCHOLAR_NAME}</span>
                      </span>
                    </div>
                  </div>

                  {/* Direct Skyroom Entrance Button */}
                  <button
                    type="button"
                    onClick={() => handleEnterSkyroom(session.courseId, session.skyroomUrl)}
                    disabled={isEnteringLive === session.courseId}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-300" />
                    <span>
                      {isEnteringLive === session.courseId
                        ? 'دریافت توکن ورود...'
                        : 'ورود مستقیم به کلاس'}
                    </span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
