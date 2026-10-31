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
  const { toLocale, dict } = useLanguage();

  const activeCount = drmSessions.filter((s) => s.status === 'فعال').length;

  return (
    <div className="space-y-6 text-start">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A532B]"></span>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {dict.admin_drm_title}
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {dict.admin_drm_desc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400">
            {dict.admin_drm_active_sessions} <strong className="text-zinc-900 dark:text-zinc-100 font-num">{toLocale(activeCount)}</strong>
          </span>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50 dark:bg-zinc-900/50">
                <th className="py-3 px-4 font-normal text-start">{dict.admin_drm_th_user}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_drm_th_course}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_drm_th_chapter}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_drm_th_ip}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_drm_th_watermark}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_drm_th_status}</th>
                <th className="py-3 px-4 font-normal text-start">{dict.admin_drm_th_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {drmSessions.map((session) => (
                <tr key={session.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 block">{session.phone}</span>
                    <span className="font-mono text-[11px] text-zinc-400 block">{session.id}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                    {session.courseTitle}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {session.chapterTitle}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500">
                    <div>{session.ip}</div>
                    <div className="text-[11px] text-zinc-400">{session.device}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#8A532B]">
                    {session.watermarkUid}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#8A532B]/10 text-[#8A532B]"
                    >
                      {session.status === 'فعال' ? dict.admin_coupons_status_active : dict.admin_coupons_status_inactive}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {session.status === 'فعال' && (
                      <button
                        onClick={() => {
                          if (confirm(dict.admin_drm_confirm_revoke)) {
                            revokeDrmSession(session.id);
                          }
                        }}
                        className="px-3 py-1 rounded bg-[#8A532B]/10 hover:bg-[#8A532B]/20 text-[#8A532B] text-[11px] font-medium transition cursor-pointer"
                      >
                        {dict.admin_drm_btn_revoke}
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
