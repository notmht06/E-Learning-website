'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useLanguage } from '@/context/LanguageContext';
import { AuthTabs } from '@/components/auth/AuthTabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { OtpVerificationForm } from '@/components/auth/OtpVerificationForm';

function LoginContent() {
  const { localizeHref, dict } = useLanguage();
  const {
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
    isSubmitting,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleDirectPasswordRegister,
    handleVerifyOtpCode,
    handleResendOtp,
  } = useAuthForm();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF8F5] dark:bg-[#0C0D0E] select-none text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-md text-start">
        
        {/* Scholar Branding & Title */}
        <div className="text-center space-y-2">
          <Link
            href={localizeHref('/')}
            className="inline-flex w-12 h-12 rounded-xl bg-[#8A532B] text-white items-center justify-center shadow-xs mx-auto hover:bg-[#724424] active:scale-95 transition cursor-pointer"
            title="صفحه اصلی"
          >
            <BookOpen className="w-6 h-6" />
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
            پایگاه آثار حجت الاسلام دکتر زنجیر زن حسینی
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {step === 'otp_verify'
              ? dict.auth_step_otp_verify_desc
              : activeTab === 'login'
              ? dict.auth_step_login_desc
              : dict.auth_step_register_desc}
          </p>
        </div>

        {/* Dynamic Step View: OTP verification vs Form */}
        {step === 'otp_verify' ? (
          <OtpVerificationForm
            phone={phone}
            fullName={activeTab === 'register' ? fullName : undefined}
            initialExpiresIn={expiresIn}
            mockCode={mockCode}
            onVerify={handleVerifyOtpCode}
            onResend={handleResendOtp}
            onBack={() => setStep('form')}
            isSubmitting={isSubmitting}
            externalError={errors.general}
          />
        ) : (
          <>
            {/* Tab Switcher: Login vs Register */}
            <AuthTabs
              activeTab={activeTab}
              onTabChange={switchTab}
              loginLabel={dict.auth_tab_login}
              registerLabel={dict.auth_tab_register}
            />

            {/* Dynamic Form View */}
            {activeTab === 'login' ? (
              <LoginForm
                phone={phone}
                password={password}
                errors={errors}
                isSubmitting={isSubmitting}
                authMode={authMode}
                onToggleAuthMode={setAuthMode}
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
          </>
        )}

        {/* Back to Homepage Footer */}
        <div className="text-center pt-2">
          <Link
            href={localizeHref('/')}
            className="text-xs sm:text-sm font-bold text-[#8A532B] dark:text-[#C58B43] hover:underline inline-flex items-center gap-1"
          >
            <span>{dict.auth_back_to_home}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginContent />
    </React.Suspense>
  );
}
