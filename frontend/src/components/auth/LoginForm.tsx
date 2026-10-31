'use client';

import React from 'react';
import { Smartphone, Lock, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { AuthFormField } from './AuthFormField';
import { AuthFieldErrors, AuthMode } from '@/hooks/useAuthForm';
import { useLanguage } from '@/context/LanguageContext';

interface LoginFormProps {
  phone: string;
  password: string;
  errors: AuthFieldErrors;
  isSubmitting: boolean;
  onPhoneChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  authMode?: AuthMode;
  onToggleAuthMode?: (mode: AuthMode) => void;
}

export function LoginForm({
  phone,
  password,
  errors,
  isSubmitting,
  onPhoneChange,
  onPasswordChange,
  onSubmit,
  authMode = 'password',
  onToggleAuthMode,
}: LoginFormProps) {
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

      {/* Mode Switcher pill */}
      {onToggleAuthMode && (
        <div className="flex items-center justify-between p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs">
          <button
            type="button"
            onClick={() => onToggleAuthMode('password')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'password'
                ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{dict.auth_password_login_mode}</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleAuthMode('otp')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'otp'
                ? 'bg-white dark:bg-[#141518] text-[#8A532B] dark:text-[#C58B43] shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{dict.auth_otp_login_mode}</span>
          </button>
        </div>
      )}

      <AuthFormField
        label={dict.auth_phone_label}
        name="login_phone"
        type="tel"
        placeholder={dict.auth_phone_placeholder}
        value={phone}
        onChange={onPhoneChange}
        error={errors.phone}
        required
        autoComplete="tel"
        dir="ltr"
        icon={<Smartphone className="w-4 h-4" />}
      />

      {authMode === 'password' ? (
        <AuthFormField
          label={dict.auth_password_label}
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
      ) : (
        <div className="p-3 rounded-xl bg-[#8A532B]/5 dark:bg-[#C58B43]/10 border border-[#8A532B]/20 dark:border-[#C58B43]/25 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
          <span>{dict.auth_otp_login_notice}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {authMode === 'otp'
                ? dict.auth_otp_sending
                : dict.auth_login_submitting}
            </span>
          </>
        ) : (
          <span>
            {authMode === 'otp'
              ? dict.auth_otp_login_btn
              : dict.auth_login_submit_btn}
          </span>
        )}
      </button>
    </form>
  );
}

export default LoginForm;
