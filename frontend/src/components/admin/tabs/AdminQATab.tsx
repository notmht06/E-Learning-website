'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Send,
  X,
  User,
  BookOpen,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { useLanguage } from '@/context/LanguageContext';
import { QADiscussion } from '@/types';
import { toast } from 'sonner';

export function AdminQATab() {
  const { toLocale } = useLanguage();
  const [questions, setQuestions] = useState<QADiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<QADiscussion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await apiClient.qa.getAll();
      if (Array.isArray(data)) {
        setQuestions(data);
      }
    } catch (err) {
      console.error('Failed to fetch Q&A questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const filtered = questions.filter((q) => {
    const matchesSearch =
      !search ||
      q.title.includes(search) ||
      q.question_text.includes(search) ||
      q.user_name.includes(search);
    const isAnswered = Boolean(q.is_answered || q.is_resolved || q.answer_text);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !isAnswered) ||
      (statusFilter === 'answered' && isAnswered);
    return matchesSearch && matchesStatus;
  });

  const handleOpenAnswer = (q: QADiscussion) => {
    setSelectedQuestion(q);
    setAnswerText(q.answer_text || '');
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !answerText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const updated = await apiClient.qa.answer(selectedQuestion.id, answerText.trim());
      toast.success('پاسخ استاد با موفقیت در تالار گفتگو منتشر شد.');
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === selectedQuestion.id
            ? { ...item, ...updated, is_answered: true, is_resolved: true, answer_text: answerText.trim() }
            : item
        )
      );
      setSelectedQuestion(null);
      setAnswerText('');
    } catch (err: any) {
      console.error('Failed to submit answer:', err);
      toast.error('خطا در انتشار پاسخ در سرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در پرسش‌های شاگردان..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-8 pe-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none text-zinc-700 dark:text-zinc-300"
          >
            <option value="all">همه پرسش‌ها</option>
            <option value="pending">در انتظار پاسخ استاد</option>
            <option value="answered">پاسخ‌داده‌شده</option>
          </select>
        </div>

        <div className="text-xs text-zinc-500 font-mono">
          <span>تعداد پرسش‌ها: </span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200 font-num">
            {toLocale(filtered.length)}
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500 bg-white dark:bg-[#141518] rounded-2xl border border-zinc-200 dark:border-zinc-800">
            در حال بارگذاری پرسش‌های تالار گفتگو...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 bg-white dark:bg-[#141518] rounded-2xl border border-zinc-200 dark:border-zinc-800">
            پرسشی یافت نشد.
          </div>
        ) : (
          filtered.map((q) => (
            <div
              key={q.id}
              className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3 hover:border-[#8A532B]/40 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        (q.is_answered || q.is_resolved || q.answer_text)
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {(q.is_answered || q.is_resolved || q.answer_text) ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>پاسخ داده شد</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>در انتظار پاسخ</span>
                        </>
                      )}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {q.created_at ? q.created_at.split('T')[0] : ''}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {q.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleOpenAnswer(q)}
                  className="px-3 py-1.5 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>{(q.is_answered || q.is_resolved || q.answer_text) ? 'ویرایش پاسخ' : 'پاسخ استاد'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1 font-medium">
                  <User className="w-3 h-3" />
                  <span>پرسشگر: {q.user_name}</span>
                </div>
                {q.question_text}
              </div>

              {Boolean(q.answer_text) && (
                <div className="p-3 rounded-xl bg-[#8A532B]/5 border border-[#8A532B]/20 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-[#8A532B] text-[11px] mb-1 font-bold">
                    <span>پاسخ حجت الاسلام دکتر زنجیر زن حسینی:</span>
                  </div>
                  {q.answer_text}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Answer Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-start shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                پاسخ استاد به پرسش علمی
              </h3>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="font-bold text-zinc-900 dark:text-zinc-200 mb-1">
                {selectedQuestion.title}
              </div>
              <p className="line-clamp-3">{selectedQuestion.question_text}</p>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  متن پاسخ رسمی استاد (حجت الاسلام دکتر زنجیر زن حسینی)
                </label>
                <textarea
                  rows={6}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="پاسخ برهانی و ارجاع به ابواب حکمت متعالیه و نصوص حکمی..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs outline-none focus:border-[#8A532B] resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedQuestion(null)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'در حال ثبت...' : 'انتشار پاسخ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
