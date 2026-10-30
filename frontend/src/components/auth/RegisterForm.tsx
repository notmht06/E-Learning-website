'use client';

import React from 'react';
import { User, Smartphone, Lock, ShieldCheck, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { AuthFormField } from './AuthFormField';
import { AuthFieldErrors } from '@/hooks/useAuthForm';
import { useLanguage } from '@/context/LanguageContext';

interface RegisterFormProps {
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  errors: AuthFieldErrors;
  isSubmitting: boolean;
  onFullNameChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onConfirmPasswordChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDirectPasswordSubmit?: (e: React.FormEvent) => void;
}

export function RegisterForm({
  fullName,
  phone,
  password,
  confirmPassword,
  errors,
  isSubmitting,
  onFullNameChange,
  onPhoneChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onDirectPasswordSubmit,
}: RegisterFormProps) {
  const { dict } = useLanguage();

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-start">
      {errors.general && (
        <div
          role="alert"
          className="text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs py-2 px-3 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <AuthFormField
        label="نام و نام خانوادگی"
        name="register_name"
        type="text"
        placeholder="مثال: علی موسوی"
        value={fullName}
        onChange={onFullNameChange}
        error={errors.fullName}
        required
        autoComplete="name"
        icon={<User className="w-4 h-4" />}
      />

      <AuthFormField
        label="شماره تلفن همراه"
        name="register_phone"
        type="tel"
        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
        value={phone}
        onChange={onPhoneChange}
        error={errors.phone}
        required
        autoComplete="tel"
        dir="ltr"
        icon={<Smartphone className="w-4 h-4" />}
      />

      <AuthFormField
        label="کلمه عبور"
        name="register_password"
        type="password"
        placeholder="حداقل ۶ نویسه"
        value={password}
        onChange={onPasswordChange}
        error={errors.password}
        required
        autoComplete="new-password"
        dir="ltr"
        icon={<Lock className="w-4 h-4" />}
      />

      <AuthFormField
        label="تکرار کلمه عبور"
        name="register_confirm_password"
        type="password"
        placeholder="تکرار کلمه عبور"
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        error={errors.confirmPassword}
        required
        autoComplete="new-password"
        dir="ltr"
        icon={<ShieldCheck className="w-4 h-4" />}
      />

      <div className="pt-1 space-y-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{dict.auth_otp_sending || 'در حال ارسال کد تأیید...'}</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>{dict.auth_register_otp_submit || 'دریافت کد تأیید ۶ رقمی و ثبت‌نام'}</span>
            </>
          )}
        </button>

        {onDirectPasswordSubmit && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onDirectPasswordSubmit}
            className="w-full py-2 px-3 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer text-center"
          >
            <span>یا ثبت‌نام مستقیم با کلمه عبور بدون پیامک</span>
          </button>
        )}
      </div>
    </form>
  );
}

export default RegisterForm;
