'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Lock,
  Clock,
  Trash2,
  RefreshCw,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { AdminConfirmDialog } from '../AdminConfirmDialog';

export function AdminDrmTab() {
  const { drmSessions, revokeDrmSession } = useData();
  const { toLocale, dict } = useLanguage();

  const [sessionToRevoke, setSessionToRevoke] = useState<any | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const activeCount = drmSessions.filter((s) => s.status === 'فعال').length;

  const handleRevokeConfirm = async () => {
    if (!sessionToRevoke) return;
    setIsRevoking(true);
    try {
      await revokeDrmSession(sessionToRevoke.id);
      setSessionToRevoke(null);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A532B]"></span>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8A532B]" />
              <span>{dict.admin_drm_title}</span>
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {dict.admin_drm_desc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-500">
            <span>{dict.admin_drm_active_sessions} </span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-num font-bold text-sm">
              {toLocale(activeCount)}
            </strong>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono bg-zinc-50/80 dark:bg-zinc-900/50">
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_drm_th_user}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_drm_th_course}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_drm_th_chapter}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_drm_th_ip}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_drm_th_watermark}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_drm_th_status}</th>
                <th className="py-3.5 px-4 font-normal text-start">{dict.admin_drm_th_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {drmSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400">
                    نشست استریم فعالی در حال حاضر وجود ندارد.
                  </td>
                </tr>
              ) : (
                drmSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 block" dir="ltr">
                        {session.phone}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-400 block mt-0.5">{session.id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                      {session.courseTitle}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                      {session.chapterTitle}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-500">
                      <div>{session.ip}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{session.device}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#8A532B] font-bold">
                      {session.watermarkUid}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                          session.status === 'فعال'
                            ? 'bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/20 dark:text-[#C58B43]'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {session.status === 'فعال' ? dict.admin_coupons_status_active : dict.admin_coupons_status_inactive}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {session.status === 'فعال' && (
                        <button
                          type="button"
                          onClick={() => setSessionToRevoke(session)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 text-[11px] font-bold transition active:scale-95 cursor-pointer"
                        >
                          {dict.admin_drm_btn_revoke}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revoke Session Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(sessionToRevoke)}
        title="تأیید ابطال نشست DRM"
        description={
          sessionToRevoke ? (
            <span>
              آیا از ابطال فوری توکن استریم و قطع دسترسی کاربر با شناسه «
              <strong className="font-mono">{sessionToRevoke.phone}</strong>» برای درس‌گفتار «
              <strong>{sessionToRevoke.courseTitle}</strong>» اطمینان دارید؟
            </span>
          ) : null
        }
        confirmLabel="ابطال و قطع نشست"
        cancelLabel="انصراف"
        variant="warning"
        isLoading={isRevoking}
        onConfirm={handleRevokeConfirm}
        onClose={() => setSessionToRevoke(null)}
      />
    </div>
  );
}
