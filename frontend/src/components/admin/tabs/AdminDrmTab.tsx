'use client';

import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Lock,
  Clock,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';

export function AdminDrmTab() {
  const { drmSessions, revokeDrmSession } = useData();
  const { toLocale } = useLanguage();

  const activeCount = drmSessions.filter((s) => s.status === 'فعال').length;

  return (
    <div className="space-y-6 text-start">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A532B]"></span>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              مرکز نظارت و صیانت از استریم DRM صوت ۴۸kHz
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            نظارت بر پخش جلسات، تطبیق واترمرک امنیتی و بررسی توکن‌های همزمان
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400">
            نشست‌های فعال: <strong className="text-zinc-900 dark:text-zinc-100 font-num">{toLocale(activeCount)}</strong>
          </span>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50 dark:bg-zinc-900/50">
                <th className="py-3 px-4 font-normal text-start">شناسه کاربر</th>
                <th className="py-3 px-4 font-normal text-start">دوره در حال پخش</th>
                <th className="py-3 px-4 font-normal text-start">جلسه / سرفصل</th>
                <th className="py-3 px-4 font-normal text-start">آدرس IP و دستگاه</th>
                <th className="py-3 px-4 font-normal text-start">شناسه واترمرک امنیتی</th>
                <th className="py-3 px-4 font-normal text-start">وضعیت توکن</th>
                <th className="py-3 px-4 font-normal text-start">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {drmSessions.map((session) => (
                <tr key={session.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 block">{session.phone}</span>
                    <span className="font-mono text-[10px] text-zinc-400 block">{session.id}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                    {session.courseTitle}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {session.chapterTitle}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500">
                    <div>{session.ip}</div>
                    <div className="text-[10px] text-zinc-400">{session.device}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#8A532B]">
                    {session.watermarkUid}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        session.status === 'فعال'
                          ? 'bg-[#8A532B]/10 text-[#8A532B]'
                          : 'bg-[#8A532B]/10 text-[#8A532B]'
                      }`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {session.status === 'فعال' && (
                      <button
                        onClick={() => {
                          if (confirm(`آیا توکن پخش نشست ${session.phone} ابطال شود؟`)) {
                            revokeDrmSession(session.id);
                          }
                        }}
                        className="px-3 py-1 rounded bg-[#8A532B]/10 hover:bg-[#8A532B]/20 text-[#8A532B] text-[11px] font-medium transition cursor-pointer"
                      >
                        ابطال توکن
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
