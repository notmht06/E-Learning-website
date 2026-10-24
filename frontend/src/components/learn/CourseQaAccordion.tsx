'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface QaItem {
  id: string;
  user: string;
  question: string;
  answer?: string;
  time: string;
}

const DEFAULT_QA: QaItem[] = [
  {
    id: 'qa-1',
    user: 'دانشجوی دکتری فلسفه',
    question: 'آیا تفکیک ملاصدرا میان مفهوم و مصداق وجود، معادل تمایز Sense و Reference در فلسفه فرگه است؟',
    answer:
      'پاسخ پژوهشی: خیر، تمایز صدرا ناظر به حقیقت عینی انضمامی در قبال مفهوم انتزاعی ذهنی است، در حالی که فرگه هر دو ساحت را در قلمرو دلالت زبانی و معنا مطرح می‌کند.',
    time: 'دیروز',
  },
];

interface CourseQaAccordionProps {
  courseId?: string;
  chapterId?: number;
  initialQa?: QaItem[];
}

export function CourseQaAccordion({
  courseId = 'course-falsafe-asfar-1',
  chapterId = 1,
  initialQa,
}: CourseQaAccordionProps) {
  const [qaList, setQaList] = useState<QaItem[]>(initialQa || DEFAULT_QA);
  const [questionInput, setQuestionInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiClient.qa
      .getAll(courseId)
      .then((rows) => {
        if (mounted && Array.isArray(rows) && rows.length > 0) {
          setQaList(
            rows.map((r) => ({
              id: r.id,
              user: r.user_name,
              question: r.question_text,
              answer: r.answer_text || undefined,
              time: new Date(r.created_at).toLocaleDateString('fa-IR'),
            }))
          );
        }
      })
      .catch((err) => { console.warn('Failed to load course Q&A:', err); });

    return () => {
      mounted = false;
    };
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = questionInput.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      const created = await apiClient.qa.ask(courseId, chapterId, trimmed.slice(0, 60), trimmed);
      setQaList((prev) => [
        {
          id: created.id,
          user: created.user_name,
          question: created.question_text,
          answer: created.answer_text || undefined,
          time: 'هم‌اکنون',
        },
        ...prev,
      ]);
    } catch (qaErr) {
      console.warn('Failed to submit question to backend, falling back to local list:', qaErr);
      setQaList((prev) => [
        {
          id: `qa-${Date.now()}`,
          user: 'دانش‌پژوه جاری',
          question: trimmed,
          time: 'هم‌اکنون',
        },
        ...prev,
      ]);
    } finally {
      setIsSending(false);
      setQuestionInput('');
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6 text-start">
      <div className="flex items-center justify-between border-b border-[#E6E1D8] dark:border-[#22242A] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#8A532B]" />
            <span>پرسش‌ها و مباحثات تخصصی پیرامون این جلسه</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            آکاردئون پرسش‌های علمی با پاسخ هیئت علمی حیات
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {qaList.map((item) => (
          <details
            key={item.id}
            className="group rounded-2xl bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] overflow-hidden transition"
          >
            <summary className="p-4 flex items-center justify-between cursor-pointer list-none select-none text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-zinc-400 text-[11px] shrink-0">[{item.user}]</span>
                <span className="font-bold text-[#0C0D0E] dark:text-[#FAF8F5] truncate">
                  {item.question}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform duration-200 shrink-0" />
            </summary>
            <div className="p-4 pt-1 border-t border-[#E6E1D8]/60 dark:border-[#22242A] text-xs space-y-3 text-justify">
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                <strong className="text-zinc-500 block text-[11px] mb-0.5">پرسش کامل:</strong>
                {item.question}
              </p>
              {item.answer ? (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  <span className="text-[#8A532B] dark:text-[#C58B43] font-bold block text-[11px] mb-1">
                    پاسخ علمی:
                  </span>
                  {item.answer}
                </div>
              ) : (
                <span className="text-[11px] text-[#8A532B] dark:text-[#C58B43] font-mono block">
                  در انتظار بررسی علمی استاد...
                </span>
              )}
            </div>
          </details>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-[#E6E1D8] dark:border-[#22242A]">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
          طرح پرسش یا اشکال پیرامون فرازهای این جلسه
        </label>
        <textarea
          rows={2}
          placeholder="متن اشکال یا پرسش خود را درج کنید..."
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] text-xs outline-none focus:border-[#8A532B]"
          required
        />
        <div className="flex justify-between items-center">
          {isSent && (
            <span className="text-xs text-[#8A532B] dark:text-[#C58B43] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>پرسش ثبت شد.</span>
            </span>
          )}
          <button
            type="submit"
            disabled={isSending}
            className="ms-auto px-4 py-2 rounded-xl bg-[#8A532B] hover:bg-[#724424] disabled:opacity-60 text-[#FAF8F5] text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            {isSending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3 rtl:rotate-180" />
            )}
            <span>ارسال پرسش</span>
          </button>
        </div>
      </form>
    </div>
  );
}
