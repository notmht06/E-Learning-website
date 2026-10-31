'use client';

import React, { useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useLanguage } from '@/context/LanguageContext';
import { AuthTabs } from './AuthTabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { OtpVerificationForm } from './OtpVerificationForm';
import { UserProfile } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user?: UserProfile) => void;
  defaultTab?: 'login' | 'register';
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'login',
}: AuthModalProps) {
  const { dict } = useLanguage();
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

  // Reset tab when defaultTab changes or modal opens
  useEffect(() => {
    if (isOpen) {
      switchTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleVerifyOtpSuccess = async (code: string) => {
    await handleVerifyOtpCode(code);
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop click dismiss */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => !isSubmitting && onClose()}
      />

      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-start transition-[color,background-color,border-color,opacity,transform,box-shadow]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label={dict.auth_close_modal}
          className="absolute top-4 left-4 sm:top-5 sm:left-5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scholar Branding & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-11 h-11 rounded-xl bg-[#8A532B] text-white items-center justify-center shadow-xs mx-auto">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 id="auth-modal-title" className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
            پایگاه آثار حجت الاسلام دکتر زنجیر زن حسینی
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {step === 'otp_verify'
              ? dict.auth_step_otp_verify_desc
              : activeTab === 'login'
              ? dict.auth_step_login_desc
              : dict.auth_step_register_desc}
          </p>
        </div>

        {/* Dynamic View: OTP Verification Form vs Main Auth Forms */}
        {step === 'otp_verify' ? (
          <OtpVerificationForm
            phone={phone}
            fullName={activeTab === 'register' ? fullName : undefined}
            initialExpiresIn={expiresIn}
            mockCode={mockCode}
            onVerify={handleVerifyOtpSuccess}
            onResend={handleResendOtp}
            onBack={() => setStep('form')}
            isSubmitting={isSubmitting}
            externalError={errors.general}
          />
        ) : (
          <div className="space-y-4">
            {/* Tab Switcher: Login vs Register */}
            <AuthTabs
              activeTab={activeTab}
              onTabChange={switchTab}
              loginLabel={dict.auth_tab_login}
              registerLabel={dict.auth_tab_register}
            />

            {/* Forms */}
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
                onDirectPasswordSubmit={handleDirectPasswordRegister}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
