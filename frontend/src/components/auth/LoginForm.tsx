'use client';

import React from 'react';
import { Smartphone, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { AuthFormField } from './AuthFormField';
import { AuthFieldErrors } from '@/hooks/useAuthForm';

interface LoginFormProps {
  phone: string;
  password: string;
  errors: AuthFieldErrors;
  isSubmitting: boolean;
  onPhoneChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  phone,
  password,
  errors,
  isSubmitting,
  onPhoneChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
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
        label="شماره تلفن همراه"
        name="login_phone"
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
        name="login_password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={onPasswordChange}
        error={errors.password}
        required
        autoComplete="current-password"
        dir="ltr"
        icon={<Lock className="w-4 h-4" />}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 rounded-lg bg-[#8A532B] hover:bg-[#724424] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>در حال اعتبارسنجی و ورود...</span>
          </>
        ) : (
          <span>ورود به سامانه جامع</span>
        )}
      </button>
    </form>
  );
}
