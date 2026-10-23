'use client';

import React from 'react';
import { User, Smartphone, Lock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { AuthFormField } from './AuthFormField';
import { AuthFieldErrors } from '@/hooks/useAuthForm';

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
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {errors.general && (
        <div
          role="alert"
          className="text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg text-xs py-2 px-3 flex items-center gap-2"
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 rounded-lg bg-[#8A532B] hover:bg-[#724424] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>در حال ایجاد حساب دانش‌پژوه...</span>
          </>
        ) : (
          <span>ثبت‌نام و عضویت در حیات</span>
        )}
      </button>
    </form>
  );
}
