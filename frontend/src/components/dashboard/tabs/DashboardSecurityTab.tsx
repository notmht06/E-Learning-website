'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Monitor,
  Lock,
  AlertCircle,
  KeyRound,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/services/apiClient';

interface ActiveDeviceItem {
  id: string;
  device_name: string;
  ip_address?: string;
  last_active_at: string;
  is_active: boolean;
  is_current?: boolean;
}

export function DashboardSecurityTab() {
  const { drmSessions } = useData();
  const { user, logout } = useAuth();
  const { dict, toLocale, currentLang, localizeHref } = useLanguage();

  const [devices, setDevices] = useState<ActiveDeviceItem[]>([]);
  const [maxDevices, setMaxDevices] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const formatLastActive = (dateStr: string) => {
    if (!dateStr) return '—';
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
      return new Date(parsed).toLocaleDateString(
        dict.ui_en_us,
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      );
    }
    return dateStr;
  };

  useEffect(() => {
    let mounted = true;
    apiClient.auth
      .getSessions()
      .then((res) => {
        if (mounted && res && Array.isArray(res.sessions)) {
          setDevices(res.sessions);
          setMaxDevices(res.max_concurrent_devices || 3);
        }
      })
      .catch((err) => {
        console.warn('Failed to load active sessions from backend:', err);
        if (mounted) {
          setDevices([]);
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [drmSessions]);

  const handleRevokeDevice = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      const isCurrentDevice = devices.find((d) => d.id === sessionId)?.is_current;
      await apiClient.auth.revokeSession(sessionId);
      setDevices((prev) => prev.filter((d) => d.id !== sessionId));
      if (isCurrentDevice) {
        logout();
        if (typeof window !== 'undefined') {
          window.location.href = localizeHref('/login');
        }
      }
    } catch (err) {
      console.error('Failed to revoke session:', err);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8A532B]/10 text-[#8A532B] dark:bg-[#C58B43]/20 dark:text-[#C58B43] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
              {dict.ui_security_active_device_sessions}
            </h2>
            <p className="text-xs text-zinc-500">
              {dict.ui_authorized_playback_devices_max_3_conc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] text-xs font-mono text-zinc-700 dark:text-zinc-300">
          <Lock className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43]" />
          <span>HMAC-SHA256 DRM</span>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <KeyRound className="w-4 h-4 text-[#8A532B]" />
            <span>
              {dict.ui_two_factor_auth}
            </span>
          </div>
          <p className="text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
            {dict.ui_active_via_mobile_otp}
          </p>
        </div>

        <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Smartphone className="w-4 h-4 text-[#8A532B]" />
            <span>
              {dict.ui_active_devices}
            </span>
          </div>
          <p className="text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5] font-num">
            {toLocale(devices.length)}{' '}
            {currentLang === 'en'
              ? `of ${maxDevices} slots used`
              : currentLang === 'ar'
              ? `من ${toLocale(maxDevices)} أجهزة مستخدمة`
              : `از ${toLocale(maxDevices)} دستگاه مجاز`}
          </p>
        </div>

        <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <AlertCircle className="w-4 h-4 text-[#8A532B]" />
            <span>
              {dict.ui_forensic_watermark}
            </span>
          </div>
          <p className="text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5] font-mono">
            {user?.phone ? `${user.phone.slice(0, 4)}***${user.phone.slice(-3)}` : 'DRM-ACTIVE'}
          </p>
        </div>
      </div>

      {/* Active Sessions Table */}
      <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          {dict.ui_active_authenticated_sessions}
        </h3>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#8A532B]" />
            <span>
              {dict.ui_checking_active_sessions}
            </span>
          </div>
        ) : (
          <div className="divide-y divide-[#E6E1D8] dark:divide-[#22242A]">
            {devices.map((d) => (
              <div key={d.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center shrink-0">
                    {d.device_name.toLowerCase().includes('mobile') ||
                    d.device_name.toLowerCase().includes('android') ||
                    d.device_name.toLowerCase().includes('iphone') ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Monitor className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#0C0D0E] dark:text-[#FAF8F5] truncate">
                      {d.device_name}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-mono truncate">
                      {d.ip_address || '127.0.0.1'} • {formatLastActive(d.last_active_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {d.is_current ? (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                      {dict.ui_this_device}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] border border-[#8A532B]/25">
                      {dict.ui_active}
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={revokingId === d.id}
                    onClick={() => handleRevokeDevice(d.id)}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E6E1D8] dark:border-[#22242A] text-zinc-500 hover:text-rose-700 hover:border-rose-700/40 transition cursor-pointer flex items-center gap-1 text-[11px]"
                    title={
                      dict.ui_revoke_this_session
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {dict.ui_revoke}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardSecurityTab;
