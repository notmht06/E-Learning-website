'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  Paperclip,
  Volume2,
  Copy,
  Check,
  FileText,
  RotateCcw,
  BookOpen,
  HelpCircle,
  ExternalLink,
  Video,
  Headphones,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/services/apiClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{
    source: string;
    page_or_session: string;
    snippet: string;
    media_type?: string;
    timestamp_label?: string;
    start_sec?: number;
    end_sec?: number;
  }>;
  suggestedFollowups?: string[];
  timestamp: string;
}

const getInitialWelcome = (lang: string): Message => ({
  id: 'welcome',
  role: 'assistant',
  content:
    lang === 'en'
      ? 'Greetings. I am the Scholarly AI Assistant grounded in the rational treatises and lectures of Hujjat al-Islam Dr. Zanjirzan Hosseini. You may ask philosophical questions, upload treatises for inspection, or record voice queries.'
      : lang === 'ar'
      ? 'أهلاً بكم. أنا المساعد الذكي المستند إلى أبحاث ودروس سماحة حجت الاسلام دکتر زنجیر زن حسینی. يمكنكم طرح الأسئلة الفلسفية أو رفع الملفات للتحليل أو التسجيل الصوتي.'
      : 'سلام و درود. من دستیار هوشمند علمی پایگاه آثار حجت الاسلام دکتر زنجیر زن حسینی هستم. می‌توانید پرسش‌های علمی و فلسفی خود را مطرح کنید، فایل متنی بارگذاری نمایید یا به صورت صوتی گفتگو فرمایید.',
  timestamp: lang === 'en' ? 'Just now' : lang === 'ar' ? 'الآن' : 'هم‌اکنون',
  suggestedFollowups:
    lang === 'en'
      ? [
          'What are the proofs for the Principality of Existence in Asfar?',
          'What is the structure of lights in Suhrawardi’s Illuminationism?',
          'What is the recommended study roadmap for Islamic philosophy?',
        ]
      : lang === 'ar'
      ? [
          'ما هي براهين أصالة الوجود في الأسفار الأربعة؟',
          'كيف ينتظم عالم الأنوار في حكمة الإشراق للسهروردي؟',
          'ما هو السير الدراسي المقترح للبدء في الفلسفة الإسلامية؟',
        ]
      : [
          'براهین اصالت وجود در اسفار اربعه چیست؟',
          'نظام انوار در حکمت اشراق سهروردی چگونه است؟',
          'سیر مطالعاتی پیشنهادی برای شروع فلسفه اسلامی چیست؟',
        ],
});

export function ScholarlyAIAssistant() {
  const { currentLang, dict, toLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([getInitialWelcome(currentLang)]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubject, setActiveSubject] = useState<string>('همه');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && (prev[0].id === 'welcome' || prev[0].id === 'welcome-reset')) {
        return [getInitialWelcome(currentLang)];
      }
      return prev;
    });
  }, [currentLang]);

  const subjectOptions = useMemo(() => {
    if (currentLang === 'en') {
      return [
        { label: 'All', value: 'همه' },
        { label: 'Transcendent Wisdom', value: 'حکمت متعالیه' },
        { label: 'Illuminationist Philosophy', value: 'فلسفه اشراق' },
        { label: 'Logic', value: 'مبادی منطق' },
        { label: 'Jurisprudence Theory', value: 'اصول فقه' },
      ];
    }
    if (currentLang === 'ar') {
      return [
        { label: 'الكل', value: 'همه' },
        { label: 'الحكمة المتعالية', value: 'حکمت متعالیه' },
        { label: 'حكمة الإشراق', value: 'فلسفه اشراق' },
        { label: 'مبادئ المنطق', value: 'مبادی منطق' },
        { label: 'أصول الفقه', value: 'اصول فقه' },
      ];
    }
    return [
      { label: 'همه', value: 'همه' },
      { label: 'حکمت متعالیه', value: 'حکمت متعالیه' },
      { label: 'فلسفه اشراق', value: 'فلسفه اشراق' },
      { label: 'مبادی منطق', value: 'مبادی منطق' },
      { label: 'اصول فقه', value: 'اصول فقه' },
    ];
  }, [currentLang]);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cleanupRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const cancelSpeechSynthesis = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    return () => {
      cleanupRecognition();
      cancelSpeechSynthesis();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      cleanupRecognition();
      cancelSpeechSynthesis();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Web Speech API Voice Recognition setup
  const toggleRecording = () => {
    if (isRecording) {
      cleanupRecognition();
      return;
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert(
          currentLang === 'en'
            ? 'Speech recognition is not supported in this browser. Please use keyboard input.'
            : 'قابلیت تبدیل صوت به متن در این مرورگر پشتیبانی نمی‌شود. لطفاً از ورودی متنی استفاده فرمایید.'
        );
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'fa-IR';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((res: any) => res[0].transcript)
            .join('');
          setInputText(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          cleanupRecognition();
        };

        recognition.onend = () => {
          cleanupRecognition();
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error('Speech recognition start failed:', err);
        cleanupRecognition();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setUploadedFile({
        name: file.name,
        content: text.slice(0, 10000),
      });
    };
    reader.readAsText(file);
  };

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLang === 'en' ? 'en-US' : currentLang === 'ar' ? 'ar-SA' : 'fa-IR';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: currentLang === 'en' ? 'Just now' : currentLang === 'ar' ? 'الآن' : 'هم‌اکنون',
    };

    const assistantMsgId = `assistant-${Date.now() + 1}`;
    const placeholderAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: currentLang === 'en' ? 'Just now' : currentLang === 'ar' ? 'الآن' : 'هم‌اکنون',
    };

    setMessages((prev) => [...prev, userMsg, placeholderAssistantMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome' && m.id !== 'welcome-reset' && m.content.trim().length > 0)
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await apiClient.ai.streamChat(
        {
          message: query,
          history: historyPayload,
          subject_filter: activeSubject !== 'همه' ? activeSubject : undefined,
          file_context: uploadedFile?.content,
          file_name: uploadedFile?.name,
        },
        (liveAccumulatedText) => {
          if (!controller.signal.aborted) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMsgId ? { ...m, content: liveAccumulatedText } : m))
            );
          }
        },
        undefined,
        undefined,
        controller.signal
      );

      if (controller.signal.aborted) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: res.reply,
                citations: res.citations,
                suggestedFollowups: res.suggested_followups,
              }
            : m
        )
      );
    } catch (err: any) {
      if (controller.signal.aborted || err?.name === 'AbortError') {
        // Clean up empty assistant placeholder if cancelled before any chunks arrived
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId || m.content.trim().length > 0));
        return;
      }
      const connectionErrorReply =
        currentLang === 'en'
          ? 'Failed to connect to the scholarly assistant. Please check your network connection and try again.'
          : currentLang === 'ar'
          ? 'تعذر الاتصال بالمساعد الذكي للدروس. يرجى التحقق من اتصال الشبكة والمحاولة مجدداً.'
          : 'خطا در برقراری ارتباط با دستیار هوشمند دروس حکمی. لطفاً اتصال اینترنت خود را بررسی کرده و مجدداً تلاش فرمایید.';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: connectionErrorReply,
                citations: [],
                suggestedFollowups: [],
              }
            : m
        )
      );
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    cleanupRecognition();
    cancelSpeechSynthesis();
    const initialWelcome = getInitialWelcome(currentLang);
    setMessages([
      {
        ...initialWelcome,
        id: 'welcome-reset',
      },
    ]);
    setUploadedFile(null);
  };

  return (
    <>
      {/* Floating Activation Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 end-6 z-40 p-3.5 rounded-2xl bg-[#8A532B] hover:bg-[#724320] text-white shadow-xl flex items-center gap-3 transition active:scale-95 border border-[#8A532B]/40 group"
        title="دستیار هوشمند فلسفی حیات"
        aria-label="دستیار هوشمند حیات"
      >
        <Sparkles className="w-5 h-5 text-[#E6CA85] group-hover:rotate-12 transition duration-200" />
        <span className="text-xs font-bold hidden sm:inline-block">
          {currentLang === 'en' ? 'AI Assistant' : currentLang === 'ar' ? 'المساعد الذكي' : 'حکمت‌یار هوشمند'}
        </span>
      </button>

      {/* Main AI Scholarly Assistant Modal/Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="bg-[#FAF8F5] dark:bg-[#121316] border border-stone-300/80 dark:border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl h-[88vh] sm:h-[680px] flex flex-col shadow-2xl overflow-hidden text-start font-sans"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-white dark:bg-[#16171B] border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#8A532B] text-white flex items-center justify-center shadow-xs shrink-0">
                    <Sparkles className="w-5 h-5 text-[#E6CA85]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {currentLang === 'en'
                          ? 'Scholarly AI Assistant'
                          : currentLang === 'ar'
                          ? 'المساعد الفلسفي الذكي'
                          : 'حکمت‌یار هوشمند حیات'}
                      </h3>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {currentLang === 'en'
                        ? 'Based on the seminars of Hujjat al-Islam Dr. Zanjirzan Hosseini'
                        : currentLang === 'ar'
                        ? 'مستند إلى أبحاث سماحة حجت الاسلام دکتر زنجیر زن حسینی'
                        : 'مستند به کرسی تدریس حجت الاسلام دکتر زنجیر زن حسینی'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetChat}
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-neutral-800 transition"
                    title={currentLang === 'en' ? 'New Conversation' : currentLang === 'ar' ? 'محادثة جديدة' : 'گفت‌وگوی تازه'}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-neutral-800 transition"
                    title={currentLang === 'en' ? 'Close' : currentLang === 'ar' ? 'إغلاق' : 'بستن پنجره'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subject Discipline Filter Chips */}
              <div className="px-4 py-3 bg-stone-100/70 dark:bg-[#18191D] border-b border-stone-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs shrink-0">
                {subjectOptions.map((sub) => (
                  <button
                    key={sub.value}
                    onClick={() => setActiveSubject(sub.value)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                      activeSubject === sub.value
                        ? 'bg-[#8A532B] text-white'
                        : 'bg-white dark:bg-neutral-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    } space-y-2`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#8A532B] text-white rounded-te-xs'
                          : 'bg-white dark:bg-[#18191D] border border-stone-200/90 dark:border-neutral-800 text-stone-800 dark:text-stone-200 rounded-ts-xs shadow-2xs'
                      }`}
                    >
                      {msg.role === 'assistant' && !msg.content && isLoading ? (
                        <div className="flex items-center gap-2 text-stone-500 py-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43] animate-spin shrink-0" />
                          <span className="text-xs">
                            {currentLang === 'en'
                              ? 'Retrieving arguments and streaming analysis...'
                              : currentLang === 'ar'
                              ? 'جارٍ استخراج الأدلة وبث التحليل البرهاني...'
                              : 'در حال استخراج براهین و استریم زنده تحلیل...'}
                          </span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line text-justify">{msg.content}</p>
                      )}

                      {/* Citations Card */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-neutral-800/80 space-y-2">
                          <span className="text-[10px] font-bold text-[#8A532B] dark:text-[#C58B43] flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>
                              {currentLang === 'en'
                                ? 'Scholarly Citations & References:'
                                : currentLang === 'ar'
                                ? 'المستندات والمراجع البرهانية:'
                                : 'مستندات و ارجاعات برهانی:'}
                            </span>
                          </span>
                          {msg.citations.map((cite, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-2.5 rounded-xl bg-stone-50 dark:bg-neutral-900 border border-stone-200/80 dark:border-neutral-800 text-[11px] space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-bold text-stone-800 dark:text-stone-200 truncate">
                                  {cite.source}
                                </div>
                                {cite.media_type && cite.media_type !== 'text' && (
                                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#8A532B]/10 dark:bg-[#C58B43]/15 text-[#8A532B] dark:text-[#C58B43] text-[10px] font-medium flex items-center gap-1">
                                    {cite.media_type === 'video' ? (
                                      <Video className="w-3 h-3" />
                                    ) : (
                                      <Headphones className="w-3 h-3" />
                                    )}
                                    <span>
                                      {cite.media_type === 'video' ? 'قطعه تصویری' : 'قطعه صوتی'}
                                    </span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                <span className="font-num">{cite.page_or_session}</span>
                                {cite.timestamp_label && (
                                  <>
                                    <span className="text-stone-300 dark:text-neutral-700">•</span>
                                    <span className="font-num text-[#8A532B] dark:text-[#C58B43] flex items-center gap-1 font-medium">
                                      <Clock className="w-3 h-3" />
                                      {cite.timestamp_label}
                                    </span>
                                  </>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-600 dark:text-stone-400 italic leading-relaxed">
                                «{cite.snippet}»
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Assistant Action Buttons */}
                      {msg.role === 'assistant' && (
                        <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-neutral-800/60 flex items-center justify-between text-[11px] text-stone-400">
                          <span className="text-[10px] font-num">{msg.timestamp}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSpeak(msg.content)}
                              className="p-1 hover:text-[#8A532B] transition"
                              title={currentLang === 'en' ? 'Voice Readout' : currentLang === 'ar' ? 'قراءة صوتية' : 'قرائت صوتی پاسخ'}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="p-1 hover:text-[#8A532B] transition"
                              title={currentLang === 'en' ? 'Copy Text' : currentLang === 'ar' ? 'نسخ النص' : 'رونوشت از متن'}
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-[#8A532B]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Suggested followups */}
                    {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 max-w-[88%]">
                        {msg.suggestedFollowups.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSendMessage(q)}
                            className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-neutral-800/80 hover:bg-[#8A532B]/10 hover:text-[#8A532B] border border-stone-200/60 dark:border-neutral-800 text-[10px] text-stone-600 dark:text-stone-300 transition text-start active:scale-95"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && !messages.some((m) => m.role === 'assistant' && !m.content) && (
                  <div className="flex items-start">
                    <div className="rounded-2xl p-3 bg-white dark:bg-[#18191D] border border-stone-200 dark:border-neutral-800 text-xs text-stone-500 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#8A532B] dark:text-[#C58B43] animate-spin shrink-0" />
                      <span>
                        {currentLang === 'en'
                          ? 'Retrieving and analyzing arguments from lecture archive...'
                          : currentLang === 'ar'
                          ? 'جارٍ استخراج وتحليل البراهين من أرشيف الدروس...'
                          : 'در حال استخراج و تحلیل براهین از آرشیو دروس...'}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Uploaded File Chip */}
              {uploadedFile && (
                <div className="px-4 py-2 bg-[#8A532B]/10 dark:bg-neutral-900 border-t border-stone-200 dark:border-neutral-800 flex items-center justify-between text-xs text-[#8A532B] dark:text-[#C58B43]">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {currentLang === 'en' ? 'Attached document: ' : currentLang === 'ar' ? 'المستند المرفق: ' : 'سند ضمیمه: '}
                      {uploadedFile.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="p-1 hover:text-[#8A532B] transition"
                    title={currentLang === 'en' ? 'Remove file' : currentLang === 'ar' ? 'حذف الملف' : 'حذف فایل'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Footer Input Box */}
              <div className="p-3 sm:p-4 bg-white dark:bg-[#16171B] border-t border-stone-200 dark:border-neutral-800 shrink-0 space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".txt,.pdf,.doc,.docx"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-xl bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-stone-300 hover:text-[#8A532B] transition"
                    title={currentLang === 'en' ? 'Upload treatise or document' : currentLang === 'ar' ? 'رفع رسالة أو مستند' : 'بارگذاری رساله یا سند متنی'}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`p-3 rounded-xl transition ${
                      isRecording
                        ? 'bg-[#8A532B] text-white ring-2 ring-[#8A532B]/30 shadow-sm'
                        : 'bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-stone-300 hover:text-[#8A532B]'
                    }`}
                    title={isRecording ? (currentLang === 'en' ? 'Stop recording' : 'توقف ضبط صوت') : (currentLang === 'en' ? 'Voice query' : 'پرسش صوتی (تبدیل گفتار به متن)')}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isRecording
                        ? currentLang === 'en'
                          ? 'Listening... please speak...'
                          : currentLang === 'ar'
                          ? 'جارٍ الاستماع... تفضل بالحديث...'
                          : 'در حال گوش دادن... لطفاً سخن بگویید...'
                        : currentLang === 'en'
                        ? 'Ask a philosophical question or state your thesis...'
                        : currentLang === 'ar'
                        ? 'اطرح سؤالك الفلسفي أو مسألتك العلمية...'
                        : 'پرسش فلسفی یا مدعای خود را بنویسید...'
                    }
                    className="flex-1 px-3.5 py-3 rounded-xl bg-stone-100 dark:bg-neutral-800/90 border border-stone-200 dark:border-neutral-700 text-xs sm:text-sm outline-none focus:border-[#8A532B] dark:focus:border-[#C58B43] text-stone-900 dark:text-stone-100 transition"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="p-3 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white disabled:opacity-40 transition active:scale-95"
                    title={currentLang === 'en' ? 'Send message' : currentLang === 'ar' ? 'إرسال الرسالة' : 'ارسال پیام'}
                  >
                    <Send className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
