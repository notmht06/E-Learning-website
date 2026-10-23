'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useAuthForm } from '@/hooks/useAuthForm';
import { AuthTabs } from '@/components/auth/AuthTabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { QuickRoleSelector } from '@/components/auth/QuickRoleSelector';

export default function LoginPage() {
  const {
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
    isSubmitting,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleQuickRole,
  } = useAuthForm();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF8F5] dark:bg-[#0C0D0E] select-none text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-md text-start">
        
        {/* Scholar Branding & Title */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex w-12 h-12 rounded-xl bg-[#8A532B] text-white items-center justify-center shadow-xs mx-auto hover:bg-[#724424] active:scale-95 transition cursor-pointer"
            title="صفحه اصلی"
          >
            <BookOpen className="w-6 h-6" />
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
            پایگاه آثار حجت الاسلام دکتر زنجیر زن حسینی
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {activeTab === 'login'
              ? 'ورود به سامانه جامع آموزش و پژوهش حکمت اسلامی'
              : 'ثبت‌نام و عضویت در سامانه تخصصی حیات علوم عقلی'}
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <AuthTabs
          activeTab={activeTab}
          onTabChange={switchTab}
          loginLabel="ورود به سامانه"
          registerLabel="ثبت‌نام دانش‌پژوه"
        />

        {/* Dynamic Form View */}
        {activeTab === 'login' ? (
          <LoginForm
            phone={phone}
            password={password}
            errors={errors}
            isSubmitting={isSubmitting}
            onPhoneChange={setPhone}
            onPasswordChange={setPassword}
            onSubmit={handleLoginSubmit}
          />
        ) : (
          <RegisterForm
            fullName={fullName}
            phone={phone}
            password={password}
            confirmPassword={confirmPassword}
            errors={errors}
            isSubmitting={isSubmitting}
            onFullNameChange={setFullName}
            onPhoneChange={setPhone}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handleRegisterSubmit}
          />
        )}

        {/* Quick Role Evaluation Selector */}
        <QuickRoleSelector
          onSelectRole={handleQuickRole}
          disabled={isSubmitting}
        />

        {/* Back to Homepage Footer */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs sm:text-sm font-bold text-[#8A532B] dark:text-[#C58B43] hover:underline inline-flex items-center gap-1"
          >
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
