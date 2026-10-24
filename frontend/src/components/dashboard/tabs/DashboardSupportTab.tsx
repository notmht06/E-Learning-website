'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface QuestionItem {
  id: string;
  topic: string;
  question: string;
  answer?: string;
  date: string;
  status: string;
}

export function DashboardSupportTab() {
  const [qaList, setQaList] = useState<QuestionItem[]>([
    {
      id: 'qa-1',
      topic: 'شرح اسفار اربعه - جلسه ۴',
      question: 'در بحث اصالت وجود، اگر وجود اصیل است چرا در ذهن به عنوان مفهوم کلی انتزاع می‌شود؟',
      answer:
        'پاسخ پژوهشی: تفکیک میان مفهوم ذهنی وجود (که معقول ثانی فلسفی است) با واقعیت عینی وجود، اساس پاسخ صدرالمتألهین است. مفهوم ذهنی اعتباری است، اما مصداق آن در خارج متن واقعیت است.',
      date: '۱۴۰۳/۰۶/۲۰',
      status: 'پاسخ داده‌شده',
    },
  ]);

  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newQ: QuestionItem = {
      id: `qa-${Date.now()}`,
      topic: topic || 'پرسش کلی درباره متون فلسفی',
      question,
      date: '۱۴۰۳/۰۷/۰۱',
      status: 'در حال بررسی توسط هیئت علمی',
    };

    setQaList([newQ, ...qaList]);
    apiClient.qa
      .ask('course-falsafe-asfar-1', 1, topic || 'پرسش علمی', question)
      .catch((err) => { console.warn('Failed to submit question to server:', err); });

    setTopic('');
    setQuestion('');
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <div className="space-y-6 text-start">
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            طرح پرسش علمی و ارتباط با هیئت علمی
          </h2>
          <p className="text-xs text-zinc-500">
            ارسال ابهامات متنی و دریافت پاسخ تخصصی پیرامون درس‌گفتارهای فلسفی و اصولی
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-mono text-zinc-400">ارسال پرسش جدید به سامانه حیات</h3>

        <div>
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
            موضوع یا جلسه مرتبط
          </label>
          <input
            type="text"
            placeholder="مثلاً: شرح اسفار، جلد اول، فصل دوم"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
            شرح دقیق پرسش یا اشکال علمی
          </label>
          <textarea
            rows={3}
            placeholder="پرسش خود را با ارجاع دقیق به متن مطرح بفرمایید..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
            required
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          {isSent && (
            <span className="text-xs text-[#8A532B] flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>پرسش شما با موفقیت ثبت شد و در نوبت بررسی قرار گرفت.</span>
            </span>
          )}
          <button
            type="submit"
            className="ms-auto px-5 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ارسال پرسش</span>
          </button>
        </div>
      </form>

      {/* Questions History */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-zinc-400">پیشینه پرسش‌ها و پاسخ‌های علمی</h3>
        {qaList.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.topic}</span>
              <span className="text-[11px] font-mono text-zinc-400">{item.date}</span>
            </div>

            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed text-justify">
              <strong className="text-zinc-500 block text-[11px] mb-0.5">پرسش شما:</strong>
              {item.question}
            </p>

            {item.answer ? (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed text-justify">
                <span className="text-[#8A532B] font-bold block text-[11px] mb-1">پاسخ هیئت علمی:</span>
                {item.answer}
              </div>
            ) : (
              <span className="text-[11px] text-[#8A532B] font-mono block">در انتظار تدقیق و پاسخ استاد...</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
