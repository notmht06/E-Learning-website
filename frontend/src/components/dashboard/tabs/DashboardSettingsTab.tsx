'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  Lock,
  KeyRound,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  FileBadge,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { triggerTactileHaptic } from '@/lib/haptics';

export function DashboardSettingsTab() {
  const { user, updateProfile } = useAuth();
  const { dict, toLocale } = useLanguage();

  // Profile fields state
  const [fullName, setFullName] = useState(user?.full_name || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('وارد کردن نام و نام خانوادگی الزامی است.');
      return;
    }

    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    triggerTactileHaptic('tick');

    try {
      await updateProfile({
        full_name: fullName.trim(),
        email: email.trim() || undefined,
      });
      setProfileSuccessMsg('مشخصات هویتی در سامانه ذخیره شد و در مدارک رسمی درج می‌شود.');
      toast.success('مشخصات هویتی به‌روزرسانی شد');
    } catch (err: any) {
      const msg = err?.message || 'خطا در ذخیره مشخصات کاربری';
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('کلمه عبور جدید باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('کلمه عبور جدید با تکرار آن همخوانی ندارد.');
      return;
    }

    setIsSavingPassword(true);
    triggerTactileHaptic('tick');

    try {
      await updateProfile({
        password: newPassword,
        current_password: currentPassword || undefined,
      });
      toast.success('کلمه عبور جدید ثبت شد');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err?.message || 'خطا در تغییر کلمه عبور';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 text-start max-w-4xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center shrink-0 border border-[#8A532B]/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
              تنظیمات حساب کاربری و مشخصات مدرک
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              نام و مشخصات واردشده در این بخش، مستقیماً بر روی گواهی‌نامه‌های رسمی پایان دوره چاپ خواهد شد.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] text-xs font-mono text-[#8A532B] dark:text-[#C58B43]">
          <FileBadge className="w-4 h-4" />
          <span>احراز هویت دانشنامه</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Main Column: Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identity Form Card */}
          <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
              <span>مشخصات هویتی برای درج در مدارک علمی</span>
            </h3>

            {profileSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  نام و نام خانوادگی رسمی (دقیق جهت صدور گواهی‌نامه) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: سید محمد موسوی"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8A532B] dark:focus:border-[#C58B43] transition-colors"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  لطفاً از درج پسوندهای غیررسمی خودداری نمایید تا مدرک استعلام‌پذیر باشد.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  رایانامه (ایمیل)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8A532B] dark:focus:border-[#C58B43] transition-colors font-mono"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  نسخه الکترونیک گواهی‌نامه پایان دوره به این نشانی نیز ارسال می‌شود.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  شماره تلفن همراه (شناسه یکتای حساب)
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 font-mono" dir="ltr">
                  <Phone className="w-4 h-4 text-zinc-400" />
                  <span>{user?.phone || '—'}</span>
                  <span className="ms-auto text-[11px] text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                    تاییدشده
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#8A532B] hover:bg-[#724423] dark:bg-[#C58B43] dark:hover:bg-[#b07835] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>ذخیره تغییرات مشخصات هویتی</span>
                </button>
              </div>
            </form>
          </div>

          {/* Password Security Form Card */}
          <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
              <KeyRound className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
              <span>تغییر کلمه عبور</span>
            </h3>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  کلمه عبور فعلی
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8A532B] dark:focus:border-[#C58B43] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    کلمه عبور جدید (حداقل ۶ نویسه) *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8A532B] dark:focus:border-[#C58B43] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    تکرار کلمه عبور جدید *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#8A532B] dark:focus:border-[#C58B43] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#8A532B] dark:border-[#C58B43] text-[#8A532B] dark:text-[#C58B43] hover:bg-[#8A532B]/10 dark:hover:bg-[#C58B43]/10 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>به‌روزرسانی کلمه عبور</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Certificate Card Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FAF8F5] dark:bg-[#101114] border border-[#E6E1D8] dark:border-[#22242A] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <FileBadge className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
                پیش‌نمایش نام در دانشنامه رسمی
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold">
                برخط
              </span>
            </div>

            {/* Bespoke Antique Certificate Simulation */}
            <div className="relative rounded-xl p-5 border-2 border-dashed border-[#8A532B]/30 dark:border-[#C58B43]/30 bg-white/80 dark:bg-[#18191D]/80 backdrop-blur-xs space-y-4 text-center">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                  ACADEMIC COMPLETION CERTIFICATE
                </p>
                <h4 className="text-sm font-bold text-[#8A532B] dark:text-[#C58B43]">
                  گواهی‌نامه رسمی پایان درس‌گفتار
                </h4>
                <p className="text-[11px] text-zinc-500">
                  کرسی تدریس خارج حکمت اسلامی و معارف برهانی
                </p>
              </div>

              <div className="py-2 px-3 rounded-lg bg-[#FAF8F5] dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A]">
                <p className="text-[11px] text-zinc-500 mb-1">
                  اعطاشده به پژوهشگر ارجمند:
                </p>
                <p className="text-base font-extrabold text-[#0C0D0E] dark:text-[#FAF8F5]">
                  {fullName.trim() || 'دانشجوی گرامی'}
                </p>
              </div>

              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify px-1">
                بدین‌وسیله گواهی می‌شود که نامبرده با موفقیت مباحث و سرفصل‌های تخصصی دوره را سپری کرده و حائز رتبه علمی شایسته شده است.
              </p>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span className="font-sans font-bold text-zinc-700 dark:text-zinc-300">
                  حجت الاسلام دکتر زنجیرزن حسینی
                </span>
                <span>ZAN-CERT-1403-XXXX</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
              توجه: پس از گذراندن سرفصل‌های هر درس‌گفتار به میزان بالای ۹۰٪، گواهی رسمی با نام فوق و کد رهگیری یکتا در زبانه «گواهی‌نامه‌ها» صادر خواهد شد.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSettingsTab;
