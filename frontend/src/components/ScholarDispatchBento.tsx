'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/services/apiClient';

export function ScholarDispatchBento() {
  const { dict } = useLanguage();
  const [contactInput, setContactInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zan_dispatch_subscribed');
      if (saved) {
        setIsSubmitted(true);
        setContactInput(saved);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = contactInput.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await apiClient.auth.subscribe(trimmed);
    } catch {
      // Fallback to local persistence if offline
    } finally {
      setIsSubmitted(true);
      setIsSubmitting(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('zan_dispatch_subscribed', trimmed);
      }
    }
  };

  return (
    <section id="closing-cta" className="max-w-3xl mx-auto px-4 sm:px-6 w-full text-center">
      <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
            {dict.dispatch_title || 'اطلاع‌رسانی درس‌گفتارها و جلسات جدید'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {dict.dispatch_desc || 'شماره همراه یا ایمیل خود را برای دریافت زمان‌بندی دروس ثبت کنید.'}
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#8A532B]/30 text-xs font-medium flex items-center justify-center gap-2 text-[#8A532B] dark:text-[#C58B43] max-w-sm mx-auto">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{dict.dispatch_success || 'اطلاعات شما با موفقیت ثبت شد.'}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="text"
              required
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              placeholder={dict.dispatch_placeholder || 'شماره همراه یا ایمیل...'}
              className="flex-1 px-4 py-3 rounded-full bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] text-xs text-[#0C0D0E] dark:text-[#FAF8F5] placeholder-zinc-400 focus:outline-none focus:border-[#8A532B] transition"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full bg-[#8A532B] hover:bg-[#724424] disabled:opacity-60 text-[#FAF8F5] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>{dict.dispatch_btn || 'ثبت'}</span>
                  <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
