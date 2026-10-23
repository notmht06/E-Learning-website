'use client';

import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthFormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  autoComplete?: string;
  dir?: 'rtl' | 'ltr';
}

export function AuthFormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  icon,
  autoComplete,
  dir,
}: AuthFormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const effectiveType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1 text-start">
      <label
        htmlFor={name}
        className="block text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300"
      >
        {label}
        {required && <span className="text-red-500 ms-1">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute start-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none flex items-center">
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          dir={dir}
          className={`w-full py-2.5 text-sm rounded-lg border bg-transparent font-medium transition outline-none ${
            icon ? 'ps-9' : 'ps-3.5'
          } ${isPasswordField ? 'pe-10' : 'pe-3.5'} ${
            error
              ? 'border-red-400 dark:border-red-600 focus:border-red-500'
              : 'border-zinc-200 dark:border-zinc-700 focus:border-[#8A532B] dark:focus:border-[#C58B43]'
          }`}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
            aria-label={showPassword ? 'پنهان کردن کلمه عبور' : 'نمایش کلمه عبور'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg text-xs py-1 px-2.5 flex items-center gap-1.5 mt-1.5"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
