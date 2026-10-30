'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export type AuthTab = 'login' | 'register';
export type AuthMode = 'password' | 'otp';
export type AuthStep = 'form' | 'otp_verify';

export interface AuthFieldErrors {
  fullName?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  otpCode?: string;
  general?: string;
}

export function useAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, sendOtp, verifyOtp } = useAuth();
  const { localizeHref } = useLanguage();

  const redirectParam = searchParams.get('redirect');
  const safeRedirect = redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : null;

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [authMode, setAuthMode] = useState<AuthMode>('password');
  const [step, setStep] = useState<AuthStep>('form');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('09123456789');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mockCode, setMockCode] = useState<string | undefined>(undefined);
  const [expiresIn, setExpiresIn] = useState<number>(120);

  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldError = (field: keyof AuthFieldErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const validatePhone = (val: string): string | null => {
    const cleanPhone = val.trim();
    if (!cleanPhone) return 'لطفاً شماره تلفن همراه را وارد کنید.';
    if (!/^09\d{9}$/.test(cleanPhone)) {
      return 'شماره تماس باید ۱۱ رقم و با ۰۹ آغاز شود.';
    }
    return null;
  };

  const validatePassword = (val: string): string | null => {
    if (!val) return 'لطفاً کلمه عبور را وارد کنید.';
    if (val.length < 6) {
      return 'کلمه عبور باید حداقل ۶ نویسه باشد.';
    }
    return null;
  };

  const validateLogin = (): boolean => {
    const newErrors: AuthFieldErrors = {};
    const phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;
    if (authMode === 'password' && !password) {
      newErrors.password = 'لطفاً کلمه عبور را وارد کنید.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = (): boolean => {
    const newErrors: AuthFieldErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'لطفاً نام و نام خانوادگی خود را وارد کنید.';
    }
    const phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;
    const pwdErr = validatePassword(password);
    if (pwdErr) newErrors.password = pwdErr;
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'تکرار کلمه عبور با کلمه عبور اصلی همخوانی ندارد.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateLogin()) return;

    if (authMode === 'otp') {
      await handleSendOtpForLogin();
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const user = await login(phone.trim(), password);
      const defaultTarget = user.role === 'ADMIN' ? '/admin' : '/dashboard';
      router.push(localizeHref(safeRedirect || defaultTarget));
    } catch (err: any) {
      const msg = err?.message || 'خطا در برقراری ارتباط با سامانه.';
      if (msg.includes('شماره تماس یا کلمه عبور') || msg.includes('نادرست') || msg.includes('401')) {
        setErrors({ password: 'شماره تماس یا کلمه عبور وارد شده نادرست است.' });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateRegister()) return;

    // Dispatches 6-digit verification code to user's phone
    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await sendOtp(phone.trim());
      if (res?.expires_in_seconds) {
        setExpiresIn(res.expires_in_seconds);
      }
      if (res?.mock_code) {
        setMockCode(res.mock_code);
      }
      setStep('otp_verify');
    } catch (err: any) {
      const msg = err?.message || 'خطا در ارسال کد تأیید.';
      if (msg.includes('قبلاً در سامانه ثبت شده') || msg.includes('USER_ALREADY_EXISTS') || msg.includes('تکراری')) {
        setErrors({ phone: 'این شماره تماس قبلاً در سامانه ثبت شده است. لطفاً وارد شوید.' });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectPasswordRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateRegister()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      const user = await register(fullName.trim(), phone.trim(), password);
      const defaultTarget = user.role === 'ADMIN' ? '/admin' : '/dashboard';
      router.push(localizeHref(safeRedirect || defaultTarget));
    } catch (err: any) {
      const msg = err?.message || 'خطا در ثبت‌نام.';
      if (msg.includes('قبلاً در سامانه ثبت شده') || msg.includes('USER_ALREADY_EXISTS') || msg.includes('تکراری')) {
        setErrors({ phone: 'این شماره تماس قبلاً در سامانه ثبت شده است. لطفاً وارد شوید.' });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtpForLogin = async () => {
    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      setErrors({ phone: phoneErr });
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await sendOtp(phone.trim());
      if (res?.expires_in_seconds) {
        setExpiresIn(res.expires_in_seconds);
      }
      if (res?.mock_code) {
        setMockCode(res.mock_code);
      }
      setStep('otp_verify');
    } catch (err: any) {
      setErrors({ general: err?.message || 'خطا در ارسال کد تأیید.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtpForRegister = async () => {
    const newErrors: AuthFieldErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'لطفاً نام و نام خانوادگی خود را وارد کنید.';
    }
    const phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await sendOtp(phone.trim());
      if (res?.expires_in_seconds) {
        setExpiresIn(res.expires_in_seconds);
      }
      if (res?.mock_code) {
        setMockCode(res.mock_code);
      }
      setStep('otp_verify');
    } catch (err: any) {
      setErrors({ general: err?.message || 'خطا در ارسال کد تأیید.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpCode = async (code: string) => {
    setIsSubmitting(true);
    setErrors({});
    try {
      const user = await verifyOtp(phone.trim(), code.trim(), fullName.trim() || undefined);
      const defaultTarget = user.role === 'ADMIN' ? '/admin' : '/dashboard';
      router.push(localizeHref(safeRedirect || defaultTarget));
    } catch (err: any) {
      const msg = err?.message || 'کد تأیید واردشده نادرست یا منقضی شده است.';
      setErrors({ general: msg });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async (): Promise<string | undefined> => {
    const res = await sendOtp(phone.trim());
    if (res?.expires_in_seconds) {
      setExpiresIn(res.expires_in_seconds);
    }
    if (res?.mock_code) {
      setMockCode(res.mock_code);
    }
    return res?.mock_code;
  };

  const handleQuickRole = async (targetPhone: string, targetPass: string, role: 'student' | 'admin') => {
    setPhone(targetPhone);
    setPassword(targetPass);
    if (!targetPass) {
      setErrors({});
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const user = await login(targetPhone, targetPass);
      const defaultTarget = (role === 'admin' || user.role === 'ADMIN') ? '/admin' : '/dashboard';
      router.push(localizeHref(safeRedirect || defaultTarget));
    } catch (err: any) {
      setErrors({ general: err?.message || 'ورود سریع با خطا مواجه شد.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setStep('form');
    setErrors({});
  };

  return {
    activeTab,
    switchTab,
    authMode,
    setAuthMode,
    step,
    setStep,
    fullName,
    setFullName,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    mockCode,
    expiresIn,
    errors,
    clearFieldError,
    isSubmitting,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleDirectPasswordRegister,
    handleSendOtpForLogin,
    handleSendOtpForRegister,
    handleVerifyOtpCode,
    handleResendOtp,
    handleQuickRole,
  };
}

export default useAuthForm;
