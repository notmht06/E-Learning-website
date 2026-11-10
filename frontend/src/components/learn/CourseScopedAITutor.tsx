'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Send, BookOpen, Clock, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/services/apiClient';
import { SCHOLAR_NAME } from '@/lib/constants';

export interface CourseScopedAITutorProps {
  courseId: string;
  courseTitle: string;
  chapterId?: number;
  chapterTitle?: string;
  subject?: string;
  onSeekToSecond?: (sec: number) => void;
}

interface CitationItem {
  source: string;
  page_or_session: string;
  snippet: string;
  media_type?: string;
  timestamp_label?: string;
  start_sec?: number;
}

interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: CitationItem[];
  suggestedFollowups?: string[];
}

export function CourseScopedAITutor({
  courseId,
  courseTitle,
  chapterId = 1,
  chapterTitle = '',
  subject = 'حکمت متعالیه',
  onSeekToSecond,
}: CourseScopedAITutorProps) {
  const { currentLang, toLocale, dict } = useLanguage();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const welcomeText =
    currentLang === 'en'
      ? `Welcome to the dedicated AI Scholarly Tutor for "${courseTitle}". Ask any question regarding the arguments, proofs, and terminology of this course.`
      : currentLang === 'ar'
      ? `مرحباً بك في المساعد العلمي الذكي الخاص بدورة «${courseTitle}». اطرح أي سؤال حول براهين ومصطلحات هذه الدورة.`
      : `به دستیار هوشمند اختصاصی دوره «${courseTitle}» خوش آمدید. هر پرسشی پیرامون براهین، اصطلاحات و مباحث مطرح‌شده در جلسات این دوره دارید مطرح فرمایید.`;

  const defaultFollowups =
    currentLang === 'en'
      ? [
          `What is the main thesis of ${courseTitle}?`,
          'How does the professor prove the Primacy of Existence?',
          'Explain the key terminology of this session.',
        ]
      : currentLang === 'ar'
      ? [
          `ما هي المسألة المحورية في ${courseTitle}؟`,
          'كيف يقرر الأستاذ برهان أصالة الوجود؟',
          'اشرح المصطلحات الأساسية في هذه الجلسة.',
        ]
      : [
          'خلاصه این جلسه',
          'نکات کلیدی درس',
          'توضیح ساده‌تر این مبحث',
        ];

  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: welcomeText,
      suggestedFollowups: defaultFollowups,
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: welcomeText,
        suggestedFollowups: defaultFollowups,
      },
    ]);
  }, [courseId, currentLang, welcomeText]);

  const handleSend = async (customQuery?: string) => {
    const q = (customQuery || input).trim();
    if (!q || isLoading) return;

    const userMsg: TutorMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
    };
    const botId = `a-${Date.now() + 1}`;

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: botId, role: 'assistant', content: '' },
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const contextualPrompt = `[دوره فعلی دانشجو: ${courseTitle} (${courseId}) - ${chapterTitle}] پرسش: ${q}`;
      const res = await apiClient.ai.streamChat(
        {
          message: contextualPrompt,
          course_id: courseId,
          subject_filter: subject,
          lang: currentLang,
        },
        (liveText) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, content: liveText } : m))
          );
        }
      );

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? {
                ...m,
                content: res.reply,
                citations: res.citations,
                suggestedFollowups: res.suggested_followups,
              }
            : m
        )
      );
    } catch (err) {
      console.error('CourseScopedAITutor streamChat error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? {
                ...m,
                content:
                  dict.ai_tutor_error_msg,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 text-start">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E1D8] dark:border-[#22242A] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8A532B] text-[#FAF8F5] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#E6CA85]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0C0D0E] dark:text-[#FAF8F5]">
              {dict.ai_tutor_title}
            </h3>
            <p className="text-xs text-zinc-500 font-dana">
              {courseTitle} • {dict.scholar_name || SCHOLAR_NAME}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setMessages([
              {
                id: 'welcome-reset',
                role: 'assistant',
                content: welcomeText,
                suggestedFollowups: defaultFollowups,
              },
            ])
          }
          className="px-3 py-1.5 rounded-xl border border-[#E6E1D8] dark:border-[#22242A] text-xs text-zinc-600 dark:text-zinc-300 hover:border-[#8A532B] flex items-center gap-1.5 cursor-pointer transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{dict.ai_tutor_reset}</span>
        </button>
      </div>

      {/* Messages */}
      <div className="space-y-4 max-h-[420px] overflow-y-auto pe-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#8A532B] text-[#FAF8F5]'
                  : 'bg-[#FAF8F5] dark:bg-[#18191D] border border-[#E6E1D8] dark:border-[#22242A] text-[#0C0D0E] dark:text-zinc-200'
              }`}
            >
              <p className="whitespace-pre-line text-justify font-dana">
                {msg.content || (isLoading ? '...' : '')}
              </p>

              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#E6E1D8] dark:border-[#22242A] space-y-2">
                  <span className="text-[11px] font-bold text-[#8A532B] dark:text-[#C58B43] flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {dict.ai_tutor_citations_title}
                    </span>
                  </span>
                  {msg.citations.map((cite, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-[#141518] border border-[#E6E1D8] dark:border-[#22242A] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#0C0D0E] dark:text-zinc-100">
                          {cite.source}
                        </span>
                        {cite.timestamp_label && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onSeekToSecond && typeof cite.start_sec === 'number') {
                                onSeekToSecond(cite.start_sec);
                              }
                            }}
                            className="px-2 py-0.5 rounded-md bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43] font-num text-[11px] flex items-center gap-1 cursor-pointer hover:bg-[#8A532B] hover:text-white transition"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{toLocale(cite.timestamp_label)}</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500">{cite.page_or_session}</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-dana">
                        «{cite.snippet}»
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {msg.suggestedFollowups.map((fup, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(fup)}
                    className="px-3 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#18191D] hover:border-[#8A532B] border border-[#E6E1D8] dark:border-[#22242A] text-[11px] text-zinc-700 dark:text-zinc-300 transition cursor-pointer font-dana"
                  >
                    {fup}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-[#E6E1D8] dark:border-[#22242A]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={dict.ai_tutor_input_placeholder}
          className="flex-1 px-4 py-3 rounded-xl bg-[#FAF8F5] dark:bg-[#0C0D0E] border border-[#E6E1D8] dark:border-[#22242A] text-xs sm:text-sm outline-none focus:border-[#8A532B] font-dana"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-5 py-3 rounded-xl bg-[#8A532B] hover:bg-[#724424] disabled:opacity-50 text-[#FAF8F5] text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <span>{dict.ai_tutor_submit_btn}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
