'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Repeat,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  PERSIAN_WEEKDAY_NAMES,
  PERSIAN_WEEKDAY_SHORT,
  toPersianDigits,
  gregorianToJalali,
  generateJalaliMonthGrid,
  PERSIAN_MONTH_NAMES,
} from '@/lib/jalali';

export interface PersianCalendarPickerProps {
  value: string;
  onChange: (scheduleString: string) => void;
  highlightedDates?: string[]; // e.g. ["1405/08/15", "1405/08/22"]
  placeholder?: string;
  className?: string;
}

export function PersianCalendarPicker({
  value,
  onChange,
  highlightedDates = [],
  placeholder = 'مثال: دوشنبه‌ها ساعت ۱۸:۰۰ الی ۱۹:۳۰',
  className = '',
}: PersianCalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const todayInfo = gregorianToJalali(new Date());

  const [activeYear, setActiveYear] = useState<number>(todayInfo.year);
  const [activeMonth, setActiveMonth] = useState<number>(todayInfo.month);

  const [selectedDay, setSelectedDay] = useState<number | null>(todayInfo.day);
  const [selectedHour, setSelectedHour] = useState<string>('۱۸:۰۰');
  const [selectedRecurringDay, setSelectedRecurringDay] = useState<string>('دوشنبه‌ها');
  const [mode, setMode] = useState<'recurring' | 'specific_date'>('recurring');

  const monthGrid = generateJalaliMonthGrid(activeYear, activeMonth);

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

  // Preset time chips
  const timePresets = ['۱۶:۰۰', '۱۷:۰۰', '۱۸:۰۰', '۱۸:۳۰', '۱۹:۰۰', '۲۰:۰۰'];

  // Preset recurring day options
  const recurringDays = [
    'شنبه‌ها',
    'یکشنبه‌ها',
    'دوشنبه‌ها',
    'سه‌شنبه‌ها',
    'چهارشنبه‌ها',
    'پنجشنبه‌ها',
  ];

  const applySchedule = () => {
    if (mode === 'recurring') {
      const generated = `${selectedRecurringDay} ساعت ${selectedHour}`;
      onChange(generated);
    } else {
      const dayStr = selectedDay ? toPersianDigits(selectedDay) : toPersianDigits(todayInfo.day);
      const generated = `${dayStr} ${monthGrid.monthName} ${toPersianDigits(activeYear)} ساعت ${selectedHour}`;
      onChange(generated);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative space-y-2 text-start ${className}`}>
      {/* Visual Input Field with Calendar Trigger */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#8A532B] transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition active:scale-95 ${
            isOpen
              ? 'bg-[#8A532B] text-white border-[#8A532B]'
              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-[#8A532B]'
          }`}
          title="انتخاب از تقویم شمسی و زمان‌بندی"
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="hidden sm:inline">تقویم شمسی</span>
        </button>
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full z-40 mt-1.5 w-full max-w-md p-4 rounded-2xl bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95 duration-150 text-start">
          {/* Mode Selector Tabs (Shadcn pattern) */}
          <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('recurring')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'recurring'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>هفتگی دوره‌ای</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('specific_date')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'specific_date'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>تاریخ معین تقویم</span>
            </button>
          </div>

          {/* Mode 1: Recurring Day Picker */}
          {mode === 'recurring' ? (
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block">
                روز برگزاری نشست هفتگی:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {recurringDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedRecurringDay(day)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                      selectedRecurringDay === day
                        ? 'bg-[#8A532B]/10 border-[#8A532B] text-[#8A532B] dark:text-[#C58B43]'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {selectedRecurringDay === day && <Check className="w-3 h-3 shrink-0" />}
                    <span>{day}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Mode 2: Interactive Jalali Calendar Grid */
            <div className="space-y-3">
              {/* Calendar Month Navigation Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {monthGrid.monthName} {toPersianDigits(activeYear)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                    title="ماه بعد"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                    title="ماه قبل"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-zinc-400 pb-1">
                {PERSIAN_WEEKDAY_SHORT.map((wd) => (
                  <span key={wd}>{wd}</span>
                ))}
              </div>

              {/* Day cells grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {monthGrid.days.map((d, idx) => {
                  if (!d) {
                    return <div key={`empty-${idx}`} className="h-7" />;
                  }

                  const isSelected = selectedDay === d.dayNumber;
                  const isHighlighted = highlightedDates.includes(d.jalaliStr);

                  return (
                    <button
                      key={d.jalaliStr}
                      type="button"
                      onClick={() => setSelectedDay(d.dayNumber)}
                      className={`h-7 rounded-lg font-num text-xs transition cursor-pointer flex items-center justify-center relative ${
                        isSelected
                          ? 'bg-[#8A532B] text-white font-bold shadow-xs'
                          : d.isToday
                          ? 'border border-[#8A532B] text-[#8A532B] font-bold'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span>{toPersianDigits(d.dayNumber)}</span>
                      {isHighlighted && (
                        <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time Picker Strip */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8A532B]" />
                <span>ساعت آغاز نشست:</span>
              </label>
              <input
                type="text"
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="w-20 px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-num text-center outline-none focus:border-[#8A532B]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {timePresets.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedHour(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-num transition cursor-pointer border ${
                    selectedHour === t
                      ? 'bg-[#8A532B] text-white border-[#8A532B] font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={applySchedule}
              className="px-4 py-1.5 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
            >
              درج زمان‌بندی در دوره
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
