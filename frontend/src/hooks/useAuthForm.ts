'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export type AuthTab = 'login' | 'register';

export interface AuthFieldErrors {
  fullName?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function useAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();
  const { localizeHref } = useLanguage();

  const redirectParam = searchParams.get('redirect');
  const safeRedirect = redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : null;

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('09123456789');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (!password) newErrors.password = 'لطفاً کلمه عبور را وارد کنید.';
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
    setErrors({});
  };

  return {
    activeTab,
    switchTab,
    fullName,
    setFullName,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errors,
    clearFieldError,
    isSubmitting,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleQuickRole,
  };
}
