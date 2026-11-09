'use client';

import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, ArrowRight, RotateCw, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface OtpVerificationFormProps {
  phone: string;
  fullName?: string;
  initialExpiresIn?: number;
  mockCode?: string;
  onVerify: (code: string) => Promise<any>;
  onResend: () => Promise<string | undefined>;
  onBack: () => void;
  isSubmitting: boolean;
  externalError?: string;
}

export function OtpVerificationForm({
  phone,
  fullName,
  initialExpiresIn = 120,
  mockCode: initialMockCode,
  onVerify,
  onResend,
  onBack,
  isSubmitting,
  externalError,
}: OtpVerificationFormProps) {
  const { dict, toLocale } = useLanguage();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(initialExpiresIn);
  const [mockCode, setMockCode] = useState<string | undefined>(initialMockCode);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(externalError || null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first empty slot on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Update local error if external changes
  useEffect(() => {
    if (externalError) {
      setErrorMessage(externalError);
    }
  }, [externalError]);

  // Countdown timer tick
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const formattedStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return toLocale(formattedStr);
  };

  const normalizeDigit = (char: string): string => {
    const persianArabicDigits: Record<string, string> = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    };
    return persianArabicDigits[char] || char;
  };

  const handleDigitChange = (index: number, val: string) => {
    setErrorMessage(null);
    if (!val) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    const normalizedChars = Array.from(val).map(normalizeDigit).filter((c) => /^\d$/.test(c));
    if (normalizedChars.length === 0) return;

    if (normalizedChars.length > 1) {
      // Pasted or multiple characters
      const next = [...digits];
      let cursor = index;
      for (const ch of normalizedChars) {
        if (cursor < 6) {
          next[cursor] = ch;
          cursor++;
        }
      }
      setDigits(next);
      const targetFocus = Math.min(cursor, 5);
      inputRefs.current[targetFocus]?.focus();
      return;
    }

    const singleDigit = normalizedChars[0];
    const next = [...digits];
    next[index] = singleDigit;
    setDigits(next);

    if (index < 5 && singleDigit) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
      }
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const pasteText = e.clipboardData.getData('text');
    const normalizedChars = Array.from(pasteText).map(normalizeDigit).filter((c) => /^\d$/.test(c));
    if (normalizedChars.length > 0) {
      const next = ['', '', '', '', '', ''];
      for (let i = 0; i < Math.min(normalizedChars.length, 6); i++) {
        next[i] = normalizedChars[i];
      }
      setDigits(next);
      const targetFocus = Math.min(normalizedChars.length, 5);
      inputRefs.current[targetFocus]?.focus();
    }
  };

  const codeString = digits.join('');
  const isComplete = codeString.length === 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || isSubmitting) return;
    setErrorMessage(null);
    try {
      await onVerify(codeString);
    } catch (err: any) {
      const msg = err?.message || dict.auth_otp_invalid_error;
      setErrorMessage(msg);
    }
  };

  const handleResendClick = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);
    try {
      const newMockCode = await onResend();
      if (newMockCode) {
        setMockCode(newMockCode);
      }
      setCountdown(initialExpiresIn);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطا در ارسال مجدد کد تأیید.');
    } finally {
      setIsResending(false);
    }
  };

  const fillMockCode = () => {
    if (!mockCode || mockCode.length !== 6) return;
    const next = Array.from(mockCode);
    setDigits(next);
    inputRefs.current[5]?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-start">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#8A532B]/10 dark:bg-[#C58B43]/20 text-[#8A532B] dark:text-[#C58B43] flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50">
              {dict.auth_otp_step_title}
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            <span>{dict.auth_otp_sent_prefix}</span>
            <span className="font-num font-bold text-zinc-800 dark:text-zinc-200 dir-ltr inline-block">
              {toLocale(phone)}
            </span>
            <span>{dict.auth_otp_sent_suffix}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-[#8A532B] dark:text-[#C58B43] hover:underline flex items-center gap-1 shrink-0 pt-1 cursor-pointer"
        >
          <span>{dict.auth_otp_change_phone}</span>
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs py-2.5 px-3 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 6-Digit Segmented Input */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {dict.auth_otp_code_label}
        </label>
        <div className="flex items-center justify-between gap-2 dir-ltr" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9۰-۹٠-٩]*"
              maxLength={1}
              value={digit ? toLocale(digit) : ''}
              onFocus={(e) => e.target.select()}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isSubmitting}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center font-num text-lg sm:text-xl font-bold bg-[#FAF8F5] dark:bg-[#18191D] border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-[#8A532B] dark:focus:ring-[#C58B43] focus:border-transparent transition selection:bg-[#8A532B]/20"
            />
          ))}
        </div>
      </div>

      {/* Mock Dev Code Quick-Fill Hint */}
      {mockCode && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#8A532B]/5 dark:bg-[#C58B43]/10 border border-[#8A532B]/20 dark:border-[#C58B43]/25 text-xs text-zinc-700 dark:text-zinc-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43]" />
            <span>{dict.auth_otp_mock_server_label}</span>
            <span className="font-num font-bold text-zinc-900 dark:text-zinc-50">{toLocale(mockCode)}</span>
          </div>
          <button
            type="button"
            onClick={fillMockCode}
            className="text-[11px] font-bold text-[#8A532B] dark:text-[#C58B43] hover:underline cursor-pointer"
          >
            {dict.auth_otp_fill_mock_btn}
          </button>
        </div>
      )}

      {/* Timer & Resend Section */}
      <div className="flex items-center justify-between text-xs pt-1">
        {countdown > 0 ? (
          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
            <span>{dict.auth_otp_resend_prefix}</span>
            <span className="font-num font-bold text-[#8A532B] dark:text-[#C58B43] dir-ltr inline-block">
              {formatTimer(countdown)}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResendClick}
            disabled={isResending || isSubmitting}
            className="text-[#8A532B] dark:text-[#C58B43] hover:underline font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {isResending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{dict.auth_otp_sending}</span>
              </>
            ) : (
              <>
                <RotateCw className="w-3.5 h-3.5" />
                <span>{dict.auth_otp_resend_code}</span>
              </>
            )}
          </button>
        )}

        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
          {fullName ? `${dict.auth_otp_student_prefix}${fullName}` : (dict.auth_otp_sms_validation_tag)}
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isComplete || isSubmitting}
        className="w-full py-3 px-4 rounded-xl bg-[#8A532B] hover:bg-[#724424] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{dict.auth_otp_verifying}</span>
          </>
        ) : (
          <span>{dict.auth_otp_verify_btn}</span>
        )}
      </button>
    </form>
  );
}

export default OtpVerificationForm;
