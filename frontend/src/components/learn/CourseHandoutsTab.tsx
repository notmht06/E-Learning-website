'use client';

import React from 'react';
import { FileText, Download, Printer, BookOpen } from 'lucide-react';

interface CourseHandoutsTabProps {
  courseTitle: string;
  chapterTitle: string;
}

export function CourseHandoutsTab({ courseTitle, chapterTitle }: CourseHandoutsTabProps) {
  const handouts = [
    {
      id: 'HO-01',
      title: 'متن پیاده‌شده و مصحح جلسه (تقریر تفصیلی)',
      pages: '۱۸ صفحه',
      format: 'PDF منقح',
    },
    {
      id: 'HO-02',
      title: 'نمودار درختی و خلاصه برهان اصالت وجود',
      pages: '۲ صفحه A3',
      format: 'نقشه مفهومی',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 text-start">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#8A532B]" />
          <span>جزوات و اسناد آموزشی جلسه</span>
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          فایل‌های کمکی جهت مطالعه همراه با گوش دادن به درس
        </p>
      </div>

      <div className="space-y-3">
        {handouts.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
          >
            <div className="space-y-1">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h4>
              <span className="font-mono text-[11px] text-zinc-400">{item.pages} • {item.format}</span>
            </div>

            <button
              onClick={() => alert('دانلود فایل جزوه آغاز شد.')}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دریافت جزوه</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
